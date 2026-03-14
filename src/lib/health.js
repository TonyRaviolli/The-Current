/**
 * health.js — Per-source health tracking for The UnderCurrent pipeline.
 *
 * Tracks success rate, latency, consecutive failures, and derives
 * a health state: healthy | degraded | unstable | paused
 */

const HEALTH_WINDOW = 20; // rolling window of last N fetch outcomes
const STATE = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNSTABLE: 'unstable',
  PAUSED: 'paused'
};

/**
 * Record a successful fetch outcome for a source.
 */
export function recordFetchSuccess(healthStore, sourceId, latencyMs) {
  const h = getOrInit(healthStore, sourceId);
  h.outcomes.push({ ok: true, latencyMs, ts: Date.now() });
  if (h.outcomes.length > HEALTH_WINDOW) h.outcomes.shift();
  h.consecutiveFailures = 0;
  h.lastSuccessAt = Date.now();
  h.state = deriveState(h);
}

/**
 * Record a failed fetch outcome for a source.
 */
export function recordFetchFailure(healthStore, sourceId, reason = 'unknown') {
  const h = getOrInit(healthStore, sourceId);
  h.outcomes.push({ ok: false, reason, ts: Date.now() });
  if (h.outcomes.length > HEALTH_WINDOW) h.outcomes.shift();
  h.consecutiveFailures += 1;
  h.lastFailureAt = Date.now();
  h.state = deriveState(h);
}

/**
 * Get a summary of all source health states for the /api/health endpoint
 * and store.json inclusion.
 */
export function buildHealthSummary(healthStore, sources) {
  const byId = {};
  for (const [id, h] of Object.entries(healthStore)) {
    const outcomes = h.outcomes || [];
    const total = outcomes.length;
    const successes = outcomes.filter((o) => o.ok).length;
    const latencies = outcomes.filter((o) => o.ok && o.latencyMs != null).map((o) => o.latencyMs);
    const avgLatencyMs = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;

    byId[id] = {
      state: h.state || STATE.HEALTHY,
      successRate: total ? Math.round((successes / total) * 100) : 100,
      consecutiveFailures: h.consecutiveFailures || 0,
      avgLatencyMs,
      lastSuccessAt: h.lastSuccessAt || null,
      lastFailureAt: h.lastFailureAt || null,
      fetchCount: total
    };
  }

  // Sources with no health data yet are considered healthy
  for (const src of sources) {
    if (!byId[src.id]) {
      byId[src.id] = { state: STATE.HEALTHY, successRate: 100, consecutiveFailures: 0, avgLatencyMs: null, lastSuccessAt: null, lastFailureAt: null, fetchCount: 0 };
    }
  }

  const states = Object.values(byId).map((h) => h.state);
  const counts = {
    healthy: states.filter((s) => s === STATE.HEALTHY).length,
    degraded: states.filter((s) => s === STATE.DEGRADED).length,
    unstable: states.filter((s) => s === STATE.UNSTABLE).length,
    paused: states.filter((s) => s === STATE.PAUSED).length
  };

  return {
    sources: byId,
    summary: { ...counts, total: states.length },
    generatedAt: new Date().toISOString()
  };
}

function deriveState(h) {
  const outcomes = h.outcomes || [];
  if (!outcomes.length) return STATE.HEALTHY;

  if (h.consecutiveFailures >= 5) return STATE.PAUSED;
  if (h.consecutiveFailures >= 3) return STATE.UNSTABLE;

  const recent = outcomes.slice(-10);
  const recentFails = recent.filter((o) => !o.ok).length;
  const failRate = recentFails / recent.length;

  if (failRate >= 0.5) return STATE.UNSTABLE;
  if (failRate >= 0.25) return STATE.DEGRADED;
  return STATE.HEALTHY;
}

function getOrInit(healthStore, sourceId) {
  if (!healthStore[sourceId]) {
    healthStore[sourceId] = {
      outcomes: [],
      consecutiveFailures: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      state: STATE.HEALTHY
    };
  }
  return healthStore[sourceId];
}
