import http from 'node:http';
import https from 'node:https';
import { info, warn } from './logger.js';

function getAgent(url) {
  return url.startsWith('https') ? https : http;
}

function requestOnce(url, options = {}) {
  const agent = getAgent(url);
  const { timeoutMs = 8000, headers = {} } = options;

  return new Promise((resolve, reject) => {
    const req = agent.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve({
          status: res.statusCode || 0,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('Request timeout'));
    });
  });
}

export async function requestWithRetry(url, options = {}) {
  const { retries = 2, backoffMs = 600, timeoutMs = 8000 } = options;
  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    try {
      const response = await requestOnce(url, { timeoutMs, headers: options.headers || {} });
      return response;
    } catch (error) {
      lastError = error;
      if (attempt >= retries) break;
      const delay = backoffMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
    attempt += 1;
  }

  throw lastError || new Error('Request failed');
}

export function canFetchSource(sourceState, breaker) {
  if (!sourceState || sourceState.failures < breaker.failureThreshold) return true;
  const elapsed = Date.now() - sourceState.lastFailureAt;
  return elapsed > breaker.cooldownMs;
}

export function recordSourceFailure(cache, sourceId) {
  const state = cache.sources[sourceId] || { failures: 0, lastFailureAt: 0 };
  state.failures += 1;
  state.lastFailureAt = Date.now();
  cache.sources[sourceId] = state;
}

export function recordSourceSuccess(cache, sourceId, headers = {}) {
  cache.sources[sourceId] = {
    failures: 0,
    lastFailureAt: 0,
    etag: headers.etag || cache.sources[sourceId]?.etag || null,
    lastModified: headers['last-modified'] || cache.sources[sourceId]?.lastModified || null
  };
}

export function buildConditionalHeaders(sourceState = {}) {
  const headers = {};
  if (sourceState.etag) headers['If-None-Match'] = sourceState.etag;
  if (sourceState.lastModified) headers['If-Modified-Since'] = sourceState.lastModified;
  return headers;
}

export async function fetchTextWithCache({ url, sourceId, cache, config, force = false, healthStore = null }) {
  const sourceState = cache.sources[sourceId] || {};
  if (!force && sourceState.lastFetchAt && Date.now() - sourceState.lastFetchAt < (config.sourceIntervalMs || 0)) {
    info('source_throttled', { sourceId });
    return { status: 0, body: '', headers: {}, skipped: true };
  }
  if (!force && !canFetchSource(sourceState, config.circuitBreaker)) {
    warn('circuit_open', { sourceId });
    return { status: 0, body: '', headers: {}, skipped: true };
  }

  const headers = buildConditionalHeaders(sourceState);
  const fetchStart = Date.now();
  let response;

  try {
    response = await requestWithRetry(url, {
      timeoutMs: config.timeouts.requestMs,
      retries: config.retries.max,
      backoffMs: config.retries.backoffMs,
      headers
    });
  } catch (err) {
    const latencyMs = Date.now() - fetchStart;
    if (healthStore) {
      const { recordFetchFailure } = await import('./health.js');
      recordFetchFailure(healthStore, sourceId, err.message);
    }
    recordSourceFailure(cache, sourceId);
    throw err;
  }

  const latencyMs = Date.now() - fetchStart;

  if (response.status === 304) {
    info('cache_hit', { sourceId });
    cache.sources[sourceId] = {
      ...(cache.sources[sourceId] || {}),
      lastFetchAt: Date.now()
    };
    if (healthStore) {
      const { recordFetchSuccess } = await import('./health.js');
      recordFetchSuccess(healthStore, sourceId, latencyMs);
    }
    return { status: 304, body: '', headers: response.headers };
  }

  if (response.status >= 200 && response.status < 400) {
    recordSourceSuccess(cache, sourceId, response.headers);
    cache.sources[sourceId].lastFetchAt = Date.now();
    if (healthStore) {
      const { recordFetchSuccess } = await import('./health.js');
      recordFetchSuccess(healthStore, sourceId, latencyMs);
    }
  } else {
    recordSourceFailure(cache, sourceId);
    if (healthStore) {
      const { recordFetchFailure } = await import('./health.js');
      recordFetchFailure(healthStore, sourceId, `HTTP ${response.status}`);
    }
  }

  return {
    status: response.status,
    body: response.body.toString('utf8'),
    headers: response.headers
  };
}
