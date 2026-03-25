import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzip as gzipCb } from 'node:zlib';
import { promisify } from 'node:util';
import { refreshOnce } from './refresh.js';
import { loadJson } from './lib/store.js';
import { buildSearchIndex, searchIndex } from './lib/search.js';
import { validateContact, validateSource, validateTopic } from './lib/forms.js';
import { info, error } from './lib/logger.js';
import { scheduleRefreshLoop, cancelScheduler } from './lib/scheduler.js';
import { buildHealthSummary } from './lib/health.js';
import { loadLatestQualityReport } from './lib/metrics.js';
import { loadArchive, summarizeArchive } from './lib/archive.js';
import { summarizeSourceHistory } from './lib/source-history.js';
import { marked } from 'marked';

const gzip = promisify(gzipCb);

// ─── In-memory feed cache (stale-while-revalidate) ────────────────────────────
// Avoids hitting disk on every /api/feed request; invalidated after each refresh.
const FEED_CACHE_TTL = 30_000; // 30 s
let _feedCache = { store: null, ts: 0 };

function getFeedCached() {
  if (_feedCache.store && Date.now() - _feedCache.ts < FEED_CACHE_TTL) {
    return _feedCache.store;
  }
  return null;
}

function updateFeedCache(store) {
  _feedCache = { store, ts: Date.now() };
}

function invalidateFeedCache() {
  _feedCache = { store: null, ts: 0 };
}

// ─── Startup env validation ───────────────────────────────────────────────────

const PORT = Number(process.env.PORT || 5173);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'error', message: 'invalid_port', port: process.env.PORT }));
  process.exit(1);
}

const DATA_DIR = process.env.DATA_DIR || './data';
const STORE_PATH = `${DATA_DIR}/store.json`;
const HEALTH_PATH = `${DATA_DIR}/health.json`;
const SUBMISSIONS_DIR = `${DATA_DIR}/submissions`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SOURCES_CONFIG_PATH = path.resolve(__dirname, '../config/sources.json');
const REFRESH_CONFIG_PATH = path.resolve(__dirname, '../config/refresh.json');
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// ── Cache-bust hash — computed once at startup from asset file contents ────────
// Injected as ?v=<hash> on all /assets/ URLs in HTML so browsers always fetch
// fresh JS/CSS after a deploy (even if max-age=3600 is still in effect).
let BUILD_HASH = Date.now().toString(36); // fallback: startup timestamp
(async () => {
  try {
    const assetDir = path.join(ROOT, 'assets');
    const files = ['app.js', 'render.js', 'ui.js', 'api.js', 'styles.css'];
    const fedCss = await readFile(path.join(ROOT, 'styles', 'federal-design-system.css')).catch(() => Buffer.alloc(0));
    const contents = await Promise.all(files.map((f) => readFile(path.join(assetDir, f))));
    contents.push(fedCss);
    BUILD_HASH = createHash('md5').update(Buffer.concat(contents)).digest('hex').slice(0, 8);
  } catch { /* keep fallback */ }
})();

let indexTemplate = null;
async function loadIndexTemplate() {
  if (!indexTemplate) {
    const raw = await readFile(path.join(ROOT, 'index.html'), 'utf8');
    // Inject cache-bust hash into all /assets/ references so stale browser
    // caches are bypassed automatically after each deploy.
    indexTemplate = raw.replace(/(src|href)="(\/(assets|styles)\/[^"]+)"/g, `$1="$2?v=${BUILD_HASH}"`);
  }
  return indexTemplate;
}

let refreshInFlight = false;
const rateLimits = new Map();
const feedUpdateClients = new Set();

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendText(res, status, data, type = 'text/plain') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(data);
}

function adminAuthRequired() {
  return process.env.NODE_ENV === 'production' && Boolean(ADMIN_TOKEN);
}

function getAdminTokenFromRequest(req) {
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
  const bearer = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1] || '';
  return req.headers['x-admin-token'] || bearer || '';
}

function ensureAdmin(req, res) {
  if (!adminAuthRequired()) return true;
  if (getAdminTokenFromRequest(req) === ADMIN_TOKEN) return true;
  sendJson(res, 401, { error: 'Admin authentication required' });
  return false;
}

async function sendGzippedHtml(req, res, html) {
  const buf = Buffer.from(html, 'utf8');
  const acceptsGzip = (req.headers['accept-encoding'] || '').includes('gzip');
  if (acceptsGzip) {
    try {
      const compressed = await gzip(buf);
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Encoding': 'gzip',
        'Vary': 'Accept-Encoding',
        'Cache-Control': 'no-cache'
      });
      res.end(compressed);
      return;
    } catch { /* fall through */ }
  }
  res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
  res.end(buf);
}

function renderPage(template, { title, description, canonical, ogImage, ogImageType = 'image/svg+xml', bootData, articleJson }) {
  const safeBoot = JSON.stringify(bootData || {}).replace(/</g, '\\u003c');
  const safeArticle = JSON.stringify(articleJson || {}).replace(/</g, '\\u003c');
  return template
    .replaceAll('{{BASE_URL}}', BASE_URL)
    .replaceAll('{{PAGE_TITLE}}', title)
    .replaceAll('{{PAGE_DESCRIPTION}}', description)
    .replaceAll('{{PAGE_CANONICAL}}', canonical)
    .replaceAll('{{PAGE_OG_IMAGE}}', ogImage)
    .replaceAll('{{PAGE_OG_IMAGE_TYPE}}', ogImageType)
    .replace('{{BOOT_DATA}}', safeBoot)
    .replace('<script id=\"jsonLdArticle\" type=\"application/ld+json\">{}</script>', `<script id=\"jsonLdArticle\" type=\"application/ld+json\">${safeArticle}</script>`);
}

function escapeSvg(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderOgSvg({ title, subtitle, meta }) {
  const titleLines = wrapLines(title, 36, 3);
  const subtitleLines = wrapLines(subtitle || '', 58, 2);
  const safeMeta = escapeSvg(meta || '');
  const titleTspans = titleLines.map((line, index) => `<tspan x=\"140\" dy=\"${index === 0 ? 0 : 64}\">${escapeSvg(line)}</tspan>`).join('');
  const subtitleTspans = subtitleLines.map((line, index) => `<tspan x=\"140\" dy=\"${index === 0 ? 0 : 30}\">${escapeSvg(line)}</tspan>`).join('');
  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\" height=\"630\" viewBox=\"0 0 1200 630\">\n  <defs>\n    <linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#eef5fb\"/>\n      <stop offset=\"100%\" stop-color=\"#f8fbff\"/>\n    </linearGradient>\n  </defs>\n  <rect width=\"1200\" height=\"630\" fill=\"url(#bg)\"/>\n  <rect x=\"60\" y=\"60\" width=\"1080\" height=\"510\" rx=\"24\" fill=\"#ffffff\" stroke=\"rgba(14,72,112,0.18)\"/>\n  <circle cx=\"120\" cy=\"130\" r=\"28\" fill=\"#ab8230\"/>\n  <text x=\"120\" y=\"138\" text-anchor=\"middle\" font-family=\"JetBrains Mono, monospace\" font-size=\"18\" fill=\"#ffffff\">UC</text>\n  <text x=\"170\" y=\"138\" font-family=\"JetBrains Mono, monospace\" font-size=\"16\" fill=\"#6a8097\" letter-spacing=\"2\">THE UNDERCURRENT</text>\n  <text x=\"140\" y=\"210\" font-family=\"Cormorant Garamond, Georgia, serif\" font-size=\"54\" fill=\"#10283f\">${titleTspans}</text>\n  <text x=\"140\" y=\"320\" font-family=\"Source Sans 3, Arial, sans-serif\" font-size=\"24\" fill=\"#35506a\">${subtitleTspans}</text>\n  <text x=\"140\" y=\"520\" font-family=\"JetBrains Mono, monospace\" font-size=\"18\" fill=\"#6a8097\">${safeMeta}</text>\n</svg>`;
}

function wrapLines(text, maxChars, maxLines) {
  if (!text) return [];
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
    if (lines.length === maxLines - 1) break;
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length === maxLines && words.length > 0) {
    const last = lines[lines.length - 1];
    if (last.length > maxChars - 3) {
      lines[lines.length - 1] = last.slice(0, maxChars - 3).trimEnd() + '...';
    } else if (words.length > lines.join(' ').split(' ').length) {
      lines[lines.length - 1] = last + '...';
    }
  }
  return lines;
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'local';
}

function rateLimit(key, limit = 5, windowMs = 3600000) {
  const now = Date.now();
  const entry = rateLimits.get(key) || { count: 0, reset: now + windowMs };
  if (now > entry.reset) {
    rateLimits.delete(key);
    const fresh = { count: 1, reset: now + windowMs };
    rateLimits.set(key, fresh);
    return fresh.count <= limit;
  }
  entry.count += 1;
  rateLimits.set(key, entry);
  return entry.count <= limit;
}

function computeNextRefresh(schedule) {
  if (!Array.isArray(schedule) || !schedule.length) return null;
  const now = new Date();
  const todayUTC = now.toISOString().slice(0, 10);
  const times = schedule.map((t) => new Date(`${todayUTC}T${t}:00Z`));
  const future = times.find((t) => t > now);
  if (future) return future.toISOString();
  // All today's runs passed — return first slot tomorrow
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowUTC = tomorrow.toISOString().slice(0, 10);
  return new Date(`${tomorrowUTC}T${schedule[0]}:00Z`).toISOString();
}

function broadcastFeedUpdate(store) {
  if (!feedUpdateClients.size) return;
  const payload = JSON.stringify({
    at: new Date().toISOString(),
    storyCount: (store.stories || []).length,
    briefLead: store.brief?.lead || '',
  });
  const msg = `event: refresh\ndata: ${payload}\n\n`;
  for (const client of feedUpdateClients) {
    try { client.write(msg); } catch { feedUpdateClients.delete(client); }
  }
}

async function handleApi(req, res) {
  if (req.url === '/api/status') {
    const store = await loadJson(STORE_PATH, {});
    let refreshConfig = {};
    try { refreshConfig = JSON.parse(await readFile(REFRESH_CONFIG_PATH, 'utf8')); } catch { /* ignore */ }
    const lastRefresh = store.meta?.lastRefresh || store.lastUpdated || null;
    const refreshAge = lastRefresh ? Math.round((Date.now() - new Date(lastRefresh).getTime()) / 60000) : null;
    return sendJson(res, 200, {
      lastUpdated: store.lastUpdated,
      runId: store.runId,
      lastRefresh,
      nextRefresh: computeNextRefresh(refreshConfig.schedule),
      refreshAge,
      storyCount: (store.stories || []).length,
      briefAvailable: Boolean(store.brief?.lead),
      sourceHealth: store.sourceHealth?.summary || null,
    });
  }

  if (req.url === '/api/health') {
    const store = await loadJson(STORE_PATH, {});
    if (store.sourceHealth) return sendJson(res, 200, store.sourceHealth);
    // Fall back to reading health file directly if store doesn't have it yet
    const healthStore = await loadJson(HEALTH_PATH, {});
    const sourcesConfig = JSON.parse(await readFile(path.join(ROOT, 'config', 'sources.json'), 'utf8'));
    const allSources = Object.values(sourcesConfig.tiers).flat();
    return sendJson(res, 200, buildHealthSummary(healthStore, allSources));
  }

  if (req.url === '/api/metrics') {
    const store = await loadJson(STORE_PATH, {});
    const latestQuality = await loadLatestQualityReport();
    return sendJson(res, 200, {
      runMetrics: store.metrics || null,
      qualityMetrics: store.qualityMetrics || null,
      latestReport: latestQuality,
      lastUpdated: store.lastUpdated || null,
      refreshOutcome: store.refreshOutcome || null,
      sourceHealth: store.sourceHealth?.summary || null
    });
  }

  if (req.url === '/api/feed') {
    const cached = getFeedCached();
    if (cached) return sendJson(res, 200, cached);
    const store = await loadJson(STORE_PATH, {});
    updateFeedCache(store);
    return sendJson(res, 200, store);
  }

  if (req.url.startsWith('/api/search')) {
    const store = await loadJson(STORE_PATH, {});
    const archive = await loadArchive(DATA_DIR);
    const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
    const query = url.searchParams.get('q') || '';
    const filters = {
      tier: url.searchParams.get('tier'),
      topic: url.searchParams.get('topic'),
      source: url.searchParams.get('source'),
      fromDate: url.searchParams.get('from'),
      toDate: url.searchParams.get('to'),
      tab: url.searchParams.get('tab')
    };
    // Merge live stories with archive history; dedupe by id (live takes precedence)
    const liveStories = store.stories || [];
    const liveIds = new Set(liveStories.map((s) => s.id));
    const archiveStories = (archive.days || []).flatMap((d) => d.stories || []).filter((s) => !liveIds.has(s.id));
    const allStories = [...liveStories, ...archiveStories];
    const index = buildSearchIndex(allStories);
    const results = searchIndex(index, query, filters).slice(0, 60);
    return sendJson(res, 200, { results, total: results.length, fromArchive: archiveStories.length > 0 });
  }

  if (req.url.startsWith('/api/archive')) {
    if (req.url === '/api/archive/stats') {
      const archive = await loadArchive(DATA_DIR);
      return sendJson(res, 200, summarizeArchive(archive));
    }
    const store = await loadJson(STORE_PATH, {});
    const archive = await loadArchive(DATA_DIR);
    const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
    const range = url.searchParams.get('range') || 'week';

    // Build a live today entry from the current store, then merge with archive
    const today = new Date().toISOString().slice(0, 10);
    let days = [...(archive.days || [])];
    if ((store.stories || []).length > 0) {
      const liveEntry = { date: today, count: store.stories.length, stories: store.stories.slice(0, 20) };
      days = [liveEntry, ...days.filter((d) => d.date !== today)];
    }

    // Filter days by range
    const now = new Date();
    const filtered = days.filter((d) => {
      if (range === 'all') return true;
      const dayDate = new Date(d.date + 'T12:00:00Z');
      if (isNaN(dayDate)) return false;
      if (range === 'week') return (now - dayDate) <= 7 * 86400000;
      if (range === 'month') return dayDate.getUTCMonth() === now.getUTCMonth() && dayDate.getUTCFullYear() === now.getUTCFullYear();
      if (range === 'quarter') {
        const q = (m) => Math.floor(m / 3);
        return q(dayDate.getUTCMonth()) === q(now.getUTCMonth()) && dayDate.getUTCFullYear() === now.getUTCFullYear();
      }
      return true;
    });
    return sendJson(res, 200, { range, days: filtered, total: filtered.reduce((n, d) => n + d.count, 0) });
  }

  if (req.url.startsWith('/api/story/')) {
    const slug = req.url.split('/').pop();
    const store = await loadJson(STORE_PATH, {});
    const story = (store.stories || []).find((item) => item.slug === slug);
    if (!story) return sendJson(res, 404, { error: 'Story not found' });
    return sendJson(res, 200, { story });
  }

  if (req.url.startsWith('/api/digest/')) {
    const store = await loadJson(STORE_PATH, {});
    const digest = store.digest || null;
    if (!digest) return sendJson(res, 404, { error: 'Digest not found' });
    return sendJson(res, 200, { digest });
  }

  if (req.url === '/api/feed-updates') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(':\n\n'); // keep-alive comment
    feedUpdateClients.add(res);
    req.on('close', () => feedUpdateClients.delete(res));
    return true;
  }

  // SSE streaming refresh — emits phase events then a final done/error event
  // Refresh is intentionally public — rate-limited by refreshInFlight lock.
  if (req.url === '/api/refresh-stream' || req.url.startsWith('/api/refresh-stream?')) {
    if (refreshInFlight) return sendJson(res, 429, { error: 'Refresh already running' });
    const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
    const force = url.searchParams.get('force') === '1';

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const emit = (event, data) => {
      try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch { /* client gone */ }
    };

    const phases = [
      { delay: 0,     phase: 'fetching',   message: 'Connecting to sources\u2026' },
      { delay: 4000,  phase: 'fetching',   message: 'Fetching feeds\u2026' },
      { delay: 12000, phase: 'clustering', message: 'Clustering stories\u2026' },
      { delay: 18000, phase: 'enriching',  message: 'Running AI enrichment\u2026' },
      { delay: 28000, phase: 'enriching',  message: 'Generating intelligence brief\u2026' }
    ];

    refreshInFlight = true;
    let settled = false;
    const timers = phases.map(({ delay, phase, message }) =>
      setTimeout(() => { if (!settled) emit('phase', { phase, message }); }, delay)
    );

    req.on('close', () => { if (!settled) { settled = true; timers.forEach(clearTimeout); } });

    try {
      const store = await refreshOnce({ force });
      settled = true;
      timers.forEach(clearTimeout);
      refreshInFlight = false;
      invalidateFeedCache();
      updateFeedCache(store);
      broadcastFeedUpdate(store);
      emit('done', {
        ok: true,
        outcome: store.refreshOutcome || 'updated',
        stories: store.stories?.length || 0,
        lastUpdated: store.lastUpdated || null,
        runId: store.runId || null,
        metrics: store.metrics || {}
      });
      res.end();
    } catch (err) {
      settled = true;
      timers.forEach(clearTimeout);
      refreshInFlight = false;
      error('refresh_stream_failed', { message: err.message });
      emit('error', { message: 'Refresh failed' });
      res.end();
    }
    return;
  }

  // Standard (non-streaming) refresh — public, guarded by refreshInFlight lock.
  if (req.url === '/api/refresh' || req.url.startsWith('/api/refresh?')) {
    if (refreshInFlight) return sendJson(res, 429, { error: 'Refresh already running' });
    const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
    const force = url.searchParams.get('force') === '1';
    refreshInFlight = true;
    try {
      const store = await refreshOnce({ force });
      refreshInFlight = false;
      invalidateFeedCache();
      updateFeedCache(store);
      broadcastFeedUpdate(store);
      return sendJson(res, 200, {
        ok: true,
        outcome: store.refreshOutcome || 'updated',
        forced: force,
        lastUpdated: store.lastUpdated || null,
        runId: store.runId || null,
        stories: store.stories?.length || 0,
        metrics: store.metrics || {},
        refreshAttemptAt: store.refreshAttemptAt || null,
        sourceHealth: store.sourceHealth?.summary || null
      });
    } catch (err) {
      refreshInFlight = false;
      error('refresh_failed', { message: err.message });
      return sendJson(res, 500, { error: 'Refresh failed' });
    }
  }

  // ── Source management ──────────────────────────────────────────────────────
  if (req.url === '/api/sources' && req.method === 'GET') {
    if (!ensureAdmin(req, res)) return true;
    const config = JSON.parse(await readFile(SOURCES_CONFIG_PATH, 'utf-8'));
    const healthStore = await loadJson(HEALTH_PATH, {});
    const allSources = Object.values(config.tiers).flat().map((s) => ({
      ...s,
      health: healthStore[s.id]?.status || 'unknown'
    }));
    const active = allSources.filter((s) => s.enabled).length;
    return sendJson(res, 200, { sources: allSources, stats: { active, total: allSources.length } });
  }

  if (req.url === '/api/sources/history' && req.method === 'GET') {
    if (!ensureAdmin(req, res)) return true;
    const config = JSON.parse(await readFile(SOURCES_CONFIG_PATH, 'utf-8'));
    const allSources = Object.values(config.tiers).flat();
    return sendJson(res, 200, summarizeSourceHistory(allSources));
  }

  if (req.url === '/api/sources/toggle' && req.method === 'POST') {
    if (!ensureAdmin(req, res)) return true;
    const body = await readBody(req);
    if (!body.id) return sendJson(res, 400, { error: 'id required' });
    const config = JSON.parse(await readFile(SOURCES_CONFIG_PATH, 'utf-8'));
    let found = false;
    for (const tier of Object.values(config.tiers)) {
      const source = tier.find((s) => s.id === body.id);
      if (source) { source.enabled = !source.enabled; found = true; break; }
    }
    if (!found) return sendJson(res, 404, { error: 'Source not found' });
    await writeFile(SOURCES_CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
    return sendJson(res, 200, { ok: true });
  }

  if (req.url === '/api/sources/add' && req.method === 'POST') {
    if (!ensureAdmin(req, res)) return true;
    const body = await readBody(req);
    const { name, url: sourceUrl, tier = 2, topics = [], orientation = 'center' } = body;
    if (!name || !sourceUrl) return sendJson(res, 400, { error: 'name and url required' });
    const parsed = (() => { try { return new URL(sourceUrl); } catch { return null; } })();
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol))
      return sendJson(res, 400, { error: 'URL must use http or https' });
    const tierKey = String(tier);
    const config = JSON.parse(await readFile(SOURCES_CONFIG_PATH, 'utf-8'));
    if (!config.tiers[tierKey]) return sendJson(res, 400, { error: 'Invalid tier' });
    const baseId = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!baseId) return sendJson(res, 400, { error: 'Name must contain alphanumeric characters' });
    const allIds = new Set(Object.values(config.tiers).flat().map((s) => s.id));
    let finalId = baseId;
    let i = 2;
    while (allIds.has(finalId)) finalId = `${baseId}-${i++}`;
    const parsedTopics = Array.isArray(topics) ? topics : String(topics).split(',').map((t) => t.trim()).filter(Boolean);
    const newSource = {
      id: finalId,
      name: String(name).trim(),
      type: 'rss',
      url: String(sourceUrl).trim(),
      topics: parsedTopics,
      tier: Number(tier),
      weight: 1,
      orientation: String(orientation),
      sourceType: Number(tier) === 1 ? 'primary' : 'secondary',
      enabled: true
    };
    config.tiers[tierKey].push(newSource);
    await writeFile(SOURCES_CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
    return sendJson(res, 200, { ok: true, source: newSource });
  }

  if (req.url.startsWith('/api/sources/') && req.method === 'DELETE') {
    if (!ensureAdmin(req, res)) return true;
    let id;
    try { id = decodeURIComponent(req.url.slice('/api/sources/'.length).split('?')[0]); } catch { return sendJson(res, 400, { error: 'invalid id encoding' }); }
    if (!id) return sendJson(res, 400, { error: 'id required' });
    const config = JSON.parse(await readFile(SOURCES_CONFIG_PATH, 'utf-8'));
    let found = false;
    for (const tier of Object.values(config.tiers)) {
      const idx = tier.findIndex((s) => s.id === id);
      if (idx !== -1) { tier.splice(idx, 1); found = true; break; }
    }
    if (!found) return sendJson(res, 404, { error: 'Source not found' });
    await writeFile(SOURCES_CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
    return sendJson(res, 200, { ok: true });
  }

  // ── Scoring config ─────────────────────────────────────────────────────────
  if (req.url === '/api/scoring' && req.method === 'GET') {
    if (!ensureAdmin(req, res)) return true;
    const config = JSON.parse(await readFile(REFRESH_CONFIG_PATH, 'utf-8'));
    return sendJson(res, 200, {
      scoring: config.scoring || {},
      importance: config.importance || {},
      clustering: config.clustering || {}
    });
  }

  if (req.url === '/api/scoring' && req.method === 'POST') {
    if (!ensureAdmin(req, res)) return true;
    const body = await readBody(req);
    const config = JSON.parse(await readFile(REFRESH_CONFIG_PATH, 'utf-8'));

    if (body.scoring) {
      const s = body.scoring;
      if (s.tierWeights) {
        for (const [k, v] of Object.entries(s.tierWeights)) {
          if (!['1', '2', '3'].includes(String(k)) || typeof v !== 'number' || v < 0 || v > 2) {
            return sendJson(res, 400, { error: `Invalid tier weight for tier ${k}` });
          }
        }
        config.scoring.tierWeights = { ...config.scoring.tierWeights, ...s.tierWeights };
      }
      if (s.topicBoosts) {
        for (const [k, v] of Object.entries(s.topicBoosts)) {
          if (typeof v !== 'number' || v < 0 || v > 1) {
            return sendJson(res, 400, { error: `Invalid topic boost for "${k}"` });
          }
        }
        config.scoring.topicBoosts = { ...config.scoring.topicBoosts, ...s.topicBoosts };
      }
      for (const field of ['recencyHalfLifeHours', 'localRegionBoost', 'duplicatePenalty']) {
        if (s[field] !== undefined) {
          const v = Number(s[field]);
          if (isNaN(v) || v < 0) return sendJson(res, 400, { error: `Invalid ${field}` });
          config.scoring[field] = v;
        }
      }
    }

    if (body.importance) {
      const imp = body.importance;
      if (imp.scoreThreshold !== undefined) {
        const v = Number(imp.scoreThreshold);
        if (isNaN(v) || v < 0 || v > 1) return sendJson(res, 400, { error: 'Invalid scoreThreshold' });
        config.importance.scoreThreshold = v;
      }
      if (imp.topicTriggers !== undefined) {
        if (!Array.isArray(imp.topicTriggers)) return sendJson(res, 400, { error: 'topicTriggers must be array' });
        config.importance.topicTriggers = imp.topicTriggers.map(String).filter(Boolean).slice(0, 20);
      }
    }

    if (body.clustering) {
      const cl = body.clustering;
      if (cl.similarityThreshold !== undefined) {
        const v = Number(cl.similarityThreshold);
        if (isNaN(v) || v < 0 || v > 1) return sendJson(res, 400, { error: 'Invalid similarityThreshold' });
        config.clustering.similarityThreshold = v;
      }
      if (cl.maxHours !== undefined) {
        const v = Number(cl.maxHours);
        if (isNaN(v) || v < 1 || v > 720) return sendJson(res, 400, { error: 'Invalid maxHours' });
        config.clustering.maxHours = v;
      }
    }

    await writeFile(REFRESH_CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
    return sendJson(res, 200, { ok: true, scoring: config.scoring, importance: config.importance, clustering: config.clustering });
  }

  if (req.url === '/api/events' && req.method === 'POST') {
    const ip = getClientIp(req);
    const evKey = `events:${ip}`;
    const evNow = Date.now();
    const evLast = rateLimits.get(evKey) || 0;
    if (evNow - evLast < 1000) return sendJson(res, 429, { error: 'Too many events' });
    rateLimits.set(evKey, evNow);
    const body = await readBody(req);
    if (!body || typeof body.type !== 'string' || body.type.length > 100 || Object.keys(body).length > 10) {
      return sendJson(res, 400, { error: 'Invalid event payload' });
    }
    await writeSubmission('events', body);
    return sendJson(res, 200, { ok: true });
  }

  if (req.url === '/api/contact' && req.method === 'POST') {
    return handleForm(req, res, 'contact', validateContact);
  }

  if (req.url === '/api/submit-source' && req.method === 'POST') {
    return handleForm(req, res, 'submit-source', validateSource);
  }

  if (req.url === '/api/request-topic' && req.method === 'POST') {
    return handleForm(req, res, 'request-topic', validateTopic);
  }

  return false;
}

async function handleForm(req, res, type, validator) {
  const ip = getClientIp(req);
  if (!rateLimit(`${type}:${ip}`)) {
    return sendJson(res, 429, { error: 'Rate limit exceeded' });
  }

  let payload;
  try {
    payload = await readBody(req);
  } catch (err) {
    if (err.code === 'BODY_TOO_LARGE') return sendJson(res, 413, { error: 'Request too large' });
    return sendJson(res, 400, { error: 'Invalid request body' });
  }
  if (payload.company || payload.website) {
    return sendJson(res, 400, { error: 'Spam detected' });
  }

  const errors = validator(payload);
  if (errors.length) {
    return sendJson(res, 400, { error: 'Validation failed', fields: errors });
  }

  await writeSubmission(type, { ...payload, ip, receivedAt: new Date().toISOString() });
  return sendJson(res, 200, { ok: true });
}

async function writeSubmission(type, payload) {
  await mkdir(SUBMISSIONS_DIR, { recursive: true });
  const file = path.join(SUBMISSIONS_DIR, `${type}.jsonl`);
  const line = JSON.stringify(payload) + '\n';
  await writeFile(file, line, { flag: 'a' });
}

function readBody(req, maxBytes = 65536) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        req.destroy();
        return reject(Object.assign(new Error('Request body too large'), { code: 'BODY_TOO_LARGE' }));
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8') || '{}';
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.js') return 'application/javascript';
  if (ext === '.css') return 'text/css';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.xml') return 'application/xml';
  if (ext === '.json') return 'application/json';
  if (ext === '.ico') return 'image/x-icon';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.woff') return 'font/woff';
  if (ext === '.woff2') return 'font/woff2';
  return 'text/html';
}

async function serveStatic(req, res) {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

  if (pathname === '/' || pathname === '/index.html') {
    const template = await loadIndexTemplate();
    const html = renderPage(template, {
      title: 'The UnderCurrent — Daily Intelligence Briefing',
      description: 'Premium intelligence briefing with ranked daily feeds, weekly digests, and high-importance signals.',
      canonical: BASE_URL,
      ogImage: `${BASE_URL}/shot.png`,
      ogImageType: 'image/png',
      bootData: { page: 'home' },
      articleJson: {}
    });
    return sendGzippedHtml(req, res, html);
  }

  if (pathname.startsWith('/story/')) {
    const slug = pathname.split('/').pop();
    const store = await loadJson(STORE_PATH, {});
    const story = (store.stories || []).find((item) => item.slug === slug);
    if (!story) return sendText(res, 404, 'Not found');
    const template = await loadIndexTemplate();
    const articleJson = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: story.headline,
      datePublished: story.publishedAt,
      dateModified: story.updatedAt,
      publisher: { '@type': 'Organization', name: 'The UnderCurrent' },
      mainEntityOfPage: story.canonicalUrl,
      author: { '@type': 'Organization', name: story.sources?.[0]?.name || 'The UnderCurrent' }
    };
    const html = renderPage(template, {
      title: `${story.headline} — The UnderCurrent`,
      description: story.dek || story.whyItMatters || 'Story briefing.',
      canonical: `${BASE_URL}/story/${story.slug}`,
      ogImage: `${BASE_URL}/og/story/${story.slug}.svg`,
      ogImageType: 'image/svg+xml',
      bootData: { page: 'story', story },
      articleJson
    });
    return sendGzippedHtml(req, res, html);
  }

  if (pathname.startsWith('/digest/')) {
    const store = await loadJson(STORE_PATH, {});
    const digest = store.digest || null;
    if (!digest) return sendText(res, 404, 'Not found');
    const template = await loadIndexTemplate();
    const html = renderPage(template, {
      title: `Weekly Digest — The UnderCurrent`,
      description: digest.summary || 'Weekly intelligence digest.',
      canonical: `${BASE_URL}/digest/latest`,
      ogImage: `${BASE_URL}/og/digest/latest.svg`,
      ogImageType: 'image/svg+xml',
      bootData: { page: 'digest', digest },
      articleJson: {}
    });
    return sendGzippedHtml(req, res, html);
  }

  if (pathname.startsWith('/og/story/')) {
    const slug = pathname.split('/').pop()?.replace('.svg', '');
    const store = await loadJson(STORE_PATH, {});
    const story = (store.stories || []).find((item) => item.slug === slug);
    if (!story) return sendText(res, 404, 'Not found');
    const svg = renderOgSvg({
      title: story.headline,
      subtitle: story.dek || story.sources?.[0]?.name || 'The UnderCurrent',
      meta: `Updated ${new Date(story.updatedAt).toLocaleDateString('en-GB')}`
    });
    return sendText(res, 200, svg, 'image/svg+xml');
  }

  if (pathname.startsWith('/og/digest/')) {
    const store = await loadJson(STORE_PATH, {});
    const digest = store.digest;
    if (!digest) return sendText(res, 404, 'Not found');
    const svg = renderOgSvg({
      title: 'Weekly Digest',
      subtitle: digest.summary || 'Executive summary',
      meta: new Date().toLocaleDateString('en-GB')
    });
    return sendText(res, 200, svg, 'image/svg+xml');
  }

  const filePath = path.join(ROOT, pathname);

  try {
    const data = await readFile(filePath);
    const type = contentType(filePath);

    // ETag: short MD5 of file content for conditional GET support
    const etag = `"${createHash('md5').update(data).digest('hex').slice(0, 16)}"`;
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { ETag: etag });
      res.end();
      return;
    }

    // Cache-Control: long TTL for static assets, no-cache for HTML
    const isAsset = /\.(css|js|woff2?|png|svg|ico)$/.test(pathname);
    const cacheControl = isAsset ? 'public, max-age=3600' : 'no-cache';

    // Gzip for text-type content > 1 KB
    const isText = /^(text\/|application\/(javascript|json|xml))/.test(type);
    const acceptsGzip = (req.headers['accept-encoding'] || '').includes('gzip');
    if (acceptsGzip && isText && data.length > 1024) {
      const compressed = await gzip(data);
      res.writeHead(200, {
        'Content-Type': type,
        'Content-Encoding': 'gzip',
        'Vary': 'Accept-Encoding',
        'ETag': etag,
        'Cache-Control': cacheControl
      });
      res.end(compressed);
      return;
    }

    res.writeHead(200, { 'Content-Type': type, 'ETag': etag, 'Cache-Control': cacheControl });
    res.end(data);
  } catch {
    return sendText(res, 404, 'Not found');
  }
}

async function handleResources(req, res) {
  if (req.url !== '/api/resources' && !req.url.startsWith('/api/resources?')) return false;
  const files = ['methodology.md', 'weekly-briefing.md', 'government-civic-hub.md'];
  const result = [];
  for (const file of files) {
    try {
      const content = await readFile(path.join(ROOT, 'content', file), 'utf8');
      result.push({
        id: file.replace('.md', ''),
        html: marked.parse(content)
      });
    } catch (err) {
      result.push({ id: file.replace('.md', ''), html: '<p>Content unavailable.</p>' });
    }
  }
  sendJson(res, 200, { items: result });
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      const handledResources = await handleResources(req, res);
      if (handledResources) return;
      const handled = await handleApi(req, res);
      if (handled !== false) return;
      return sendText(res, 404, 'Not found');
    }

    return serveStatic(req, res);
  } catch (err) {
    error('unhandled_request_error', { url: req.url, message: err.message });
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'Internal server error' });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

server.listen(PORT, () => {
  info('server_started', { port: PORT, dataDir: DATA_DIR, baseUrl: BASE_URL });
});

scheduleRefreshLoop({ once: false, logPrefix: 'server' });

// ─── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown(signal) {
  info('server_shutdown', { signal });
  cancelScheduler(); // Issue 12: cancel pending scheduler timers
  server.close((err) => {
    if (err) {
      error('server_close_error', { message: err.message });
      process.exit(1);
    }
    process.exit(0);
  });
  // Force-kill if connections linger beyond 10 s
  setTimeout(() => {
    error('server_force_exit', { reason: 'shutdown timeout' });
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  error('unhandled_rejection', { message: String(reason?.message || reason) });
});

process.on('uncaughtException', (err) => {
  error('uncaught_exception', { message: err.message, stack: err.stack });
  process.exit(1);
});
