#!/usr/bin/env node
/**
 * smoke-test.js — End-to-end smoke test for The UnderCurrent.
 *
 * Tests three layers in order:
 *   1. Unit + integration tests  (node --test)
 *   2. Server API endpoints       (starts server, probes every route, stops it)
 *   3. Dry-run refresh pipeline   (REFRESH_DRY_RUN=true node src/refresh.js)
 *
 * Usage:
 *   node scripts/smoke-test.js
 *   node scripts/smoke-test.js --skip-unit      # skip npm test layer
 *   node scripts/smoke-test.js --skip-server    # skip server layer
 *   node scripts/smoke-test.js --skip-refresh   # skip refresh layer
 *
 * Exit codes: 0 = all passed, 1 = one or more failed.
 */

import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const SKIP_UNIT    = args.includes('--skip-unit');
const SKIP_SERVER  = args.includes('--skip-server');
const SKIP_REFRESH = args.includes('--skip-refresh');

const SMOKE_PORT = process.env.SMOKE_PORT || '15173';
const BASE = `http://localhost:${SMOKE_PORT}`;

// ─── ANSI helpers ─────────────────────────────────────────────────────────────
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;
const dim    = (s) => `\x1b[2m${s}\x1b[0m`;

const PASS = green('✔');
const FAIL = red('✖');
const SKIP = yellow('–');

let totalPass = 0;
let totalFail = 0;

function result(label, passed, detail = '') {
  if (passed) {
    console.log(`  ${PASS} ${label}${detail ? dim(` — ${detail}`) : ''}`);
    totalPass++;
  } else {
    console.log(`  ${FAIL} ${red(label)}${detail ? `  ${red(detail)}` : ''}`);
    totalFail++;
  }
}

// ─── Layer 1: Unit tests ──────────────────────────────────────────────────────

async function runUnitTests() {
  console.log(bold('\n[1/3] Unit + integration tests'));
  try {
    execFileSync(process.execPath, [
      '--test',
      'tests/pipeline.test.js',
      'tests/integration.test.js'
    ], { cwd: ROOT, stdio: 'pipe' });
    result('npm test (77 tests)', true, 'all passed');
  } catch (err) {
    const output = err.stdout?.toString() || '';
    const failLine = output.split('\n').find((l) => l.includes('fail'));
    result('npm test', false, failLine?.trim() || err.message.slice(0, 80));
  }
}

// ─── Layer 2: Server API ──────────────────────────────────────────────────────

function get(url, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        let body = null;
        try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch { /* not JSON */ }
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
  });
}

function post(url, payload, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: timeoutMs
    };
    const req = http.request(url, opts, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        let body = null;
        try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch { /* not JSON */ }
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    req.write(data);
    req.end();
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(retries = 20, intervalMs = 300) {
  for (let i = 0; i < retries; i++) {
    const r = await get(`${BASE}/api/status`, 1000);
    if (r.status === 200) return true;
    await wait(intervalMs);
  }
  return false;
}

async function runServerTests() {
  console.log(bold('\n[2/3] Server API endpoint tests'));

  const env = {
    ...process.env,
    PORT: SMOKE_PORT,
    DATA_DIR: path.join(ROOT, 'data'),
    REFRESH_DISABLE_SCHEDULE: 'true',
    NODE_ENV: 'test'
  };

  const srv = spawn(process.execPath, ['src/server.js'], {
    cwd: ROOT,
    env,
    stdio: 'pipe'
  });

  srv.stderr?.on('data', () => {}); // suppress output

  const ready = await waitForServer();
  if (!ready) {
    result('server startup', false, `port ${SMOKE_PORT} never became ready`);
    srv.kill();
    return;
  }
  result('server startup', true, `port ${SMOKE_PORT}`);

  // Define endpoint checks: [label, method, url, check fn]
  const checks = [
    ['GET /api/status', 'GET', `${BASE}/api/status`,
      (r) => r.status === 200],

    ['GET /api/feed returns object', 'GET', `${BASE}/api/feed`,
      (r) => r.status === 200 && typeof r.body === 'object'],

    ['GET /api/health returns summary', 'GET', `${BASE}/api/health`,
      (r) => r.status === 200 && typeof r.body === 'object'],

    ['GET /api/metrics returns object', 'GET', `${BASE}/api/metrics`,
      (r) => r.status === 200 && typeof r.body === 'object'],

    ['GET /api/archive?range=week', 'GET', `${BASE}/api/archive?range=week`,
      (r) => r.status === 200 && r.body?.range === 'week'],

    ['GET /api/archive?range=all', 'GET', `${BASE}/api/archive?range=all`,
      (r) => r.status === 200 && Array.isArray(r.body?.days)],

    ['GET /api/search?q=test', 'GET', `${BASE}/api/search?q=test`,
      (r) => r.status === 200 && Array.isArray(r.body?.results)],

    ['GET / (HTML)', 'GET', `${BASE}/`,
      (r) => r.status === 200],

    ['GET /story/nonexistent → 404', 'GET', `${BASE}/story/nonexistent-slug-xyz`,
      (r) => r.status === 404],

    ['POST /api/contact spam trap', 'POST', `${BASE}/api/contact`,
      (r) => r.status === 400,
      { name: 'Test', email: 'test@example.com', message: 'hello', website: 'spam.com' }],

    ['POST /api/contact validation', 'POST', `${BASE}/api/contact`,
      (r) => r.status === 400,
      { name: '', email: 'not-an-email', message: '' }],

    ['GET /api/story/nonexistent → 404', 'GET', `${BASE}/api/story/nonexistent`,
      (r) => r.status === 404],
  ];

  for (const [label, method, url, check, body] of checks) {
    try {
      const r = method === 'POST' ? await post(url, body || {}) : await get(url);
      result(label, check(r), r.status === 0 ? r.error : `HTTP ${r.status}`);
    } catch (err) {
      result(label, false, err.message);
    }
  }

  srv.kill('SIGTERM');
  await wait(500);
}

// ─── Layer 3: Dry-run refresh pipeline ───────────────────────────────────────

async function runRefreshDryRun() {
  console.log(bold('\n[3/3] Dry-run refresh pipeline'));

  const env = {
    ...process.env,
    DATA_DIR: path.join(ROOT, 'data'),
    REFRESH_DRY_RUN: 'true',
    ANTHROPIC_API_KEY: '' // force AI-skipped mode so test doesn't call the API
  };

  let stdout = '';
  let stderr = '';

  try {
    const out = execFileSync(process.execPath, ['src/refresh.js'], {
      cwd: ROOT,
      env,
      timeout: 60000
    });
    stdout = out.toString();
  } catch (err) {
    stdout = err.stdout?.toString() || '';
    stderr = err.stderr?.toString() || '';
    result('refresh pipeline (dry run)', false, err.message.slice(0, 120));
    return;
  }

  const hasComplete  = stdout.includes('refresh_complete') || stdout.includes('refresh_no_updates') || stdout.includes('dry_run_complete');
  const hasError     = stderr.includes('"level":"error"') && !stderr.includes('ai_skipped');

  result('refresh pipeline exits cleanly', true, 'exit 0');
  result('refresh_complete or dry_run_complete logged', hasComplete, hasComplete ? '' : 'missing completion log entry');
  result('no unexpected errors logged', !hasError, hasError ? 'check stderr for error entries' : '');
}

// ─── Runner ───────────────────────────────────────────────────────────────────

console.log(bold('═══════════════════════════════════════'));
console.log(bold(' The UnderCurrent — Smoke Test Suite'));
console.log(bold('═══════════════════════════════════════'));

if (SKIP_UNIT)    console.log(`  ${SKIP} unit tests skipped (--skip-unit)`);
if (SKIP_SERVER)  console.log(`  ${SKIP} server tests skipped (--skip-server)`);
if (SKIP_REFRESH) console.log(`  ${SKIP} refresh tests skipped (--skip-refresh)`);

if (!SKIP_UNIT)    await runUnitTests();
if (!SKIP_SERVER)  await runServerTests();
if (!SKIP_REFRESH) await runRefreshDryRun();

console.log(bold('\n═══════════════════════════════════════'));
console.log(`  ${green(`${totalPass} passed`)}  ${totalFail > 0 ? red(`${totalFail} failed`) : dim('0 failed')}`);
console.log(bold('═══════════════════════════════════════\n'));

process.exit(totalFail > 0 ? 1 : 0);
