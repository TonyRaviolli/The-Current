#!/usr/bin/env node
/**
 * health-check.js — CLI probe for The UnderCurrent server.
 *
 * Usage:
 *   node scripts/health-check.js [--url http://localhost:5173]
 *
 * Exits 0 if the server is healthy, 1 otherwise.
 * Suitable for Docker HEALTHCHECK, pm2, or uptime monitors.
 */

import http from 'node:http';

const args = process.argv.slice(2);
const urlArg = args[args.indexOf('--url') + 1];
const base = urlArg || process.env.BASE_URL || 'http://localhost:5173';

function probe(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      const ok = res.statusCode >= 200 && res.statusCode < 400;
      res.resume(); // drain
      resolve({ ok, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'timeout' });
    });
  });
}

async function main() {
  const statusUrl = `${base}/api/status`;
  const result = await probe(statusUrl);

  if (result.ok) {
    console.log(`[health-check] OK — ${statusUrl} (HTTP ${result.status})`);
    process.exit(0);
  } else {
    console.error(`[health-check] FAIL — ${statusUrl} — ${result.error || `HTTP ${result.status}`}`);
    process.exit(1);
  }
}

main();
