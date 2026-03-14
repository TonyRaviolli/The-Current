/**
 * metrics.js — Pipeline quality metrics for The UnderCurrent.
 *
 * Computes and writes the daily quality report to data/quality-YYYY-MM-DD.json.
 * Exposes helpers consumed by refresh.js and the /api/metrics endpoint.
 */

import { writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { warn } from './logger.js';

const DATA_DIR = process.env.DATA_DIR || './data';

const KNOWN_TOPICS = [
  'finance', 'macroeconomics', 'energy', 'defense', 'law', 'ai', 'biotech',
  'cyber', 'infrastructure', 'climate', 'global_trade', 'elections', 'labor',
  'housing', 'education', 'geopolitics', 'uspolitics', 'economy', 'health',
  'tech', 'science', 'engineering', 'local'
];

/**
 * Compute pipeline quality metrics for a given refresh run.
 *
 * @param {number} collectedCount  - Raw article count before dedup
 * @param {number} uniqueCount     - Article count after dedup
 * @param {Array}  stories         - Enriched stories in the run
 * @param {object} sourceHealth    - sourceHealth summary from health.js
 * @returns {object} metrics object
 */
export function computeQualityMetrics(collectedCount, uniqueCount, stories, sourceHealth) {
  const dedupeRatio = collectedCount > 0
    ? Number(((collectedCount - uniqueCount) / collectedCount).toFixed(3))
    : 0;

  const now = Date.now();
  const fresh = stories.filter((s) => now - new Date(s.publishedAt).getTime() <= 86400000);
  const freshnessScore = stories.length > 0
    ? Number((fresh.length / stories.length).toFixed(3))
    : 0;

  const topicCounts = new Map();
  for (const story of stories) {
    for (const topic of (story.topics || [])) {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    }
  }
  const uniqueTopicsCovered = [...topicCounts.keys()].filter((t) => KNOWN_TOPICS.includes(t)).length;
  const topicSpread = Number((uniqueTopicsCovered / KNOWN_TOPICS.length).toFixed(3));

  const topTopics = [...topicCounts.entries()]
    .filter(([t]) => KNOWN_TOPICS.includes(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  const sourceCounts = new Map();
  for (const story of stories) {
    for (const src of (story.sources || [])) {
      const id = src.id || src.name;
      if (id) sourceCounts.set(id, (sourceCounts.get(id) || 0) + 1);
    }
  }

  return {
    dedupeRatio,
    freshnessScore,
    topicSpread,
    storyCount: stories.length,
    freshCount: fresh.length,
    uniqueTopics: uniqueTopicsCovered,
    topTopics,
    sourceCount: sourceCounts.size,
    healthSummary: sourceHealth?.summary || null
  };
}

/**
 * Write a daily quality report JSON file.
 * File: data/quality-YYYY-MM-DD.json
 * Appended into an array so multiple runs on the same day accumulate.
 *
 * @param {object} metrics  - Result of computeQualityMetrics()
 * @param {object} runMeta  - { runId, refreshOutcome, durationMs, requests }
 */
export async function writeQualityReport(metrics, runMeta) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const file = path.join(DATA_DIR, `quality-${today}.json`);

    let existing = [];
    try {
      const raw = await import('node:fs/promises').then((m) => m.readFile(file, 'utf8'));
      existing = JSON.parse(raw);
      if (!Array.isArray(existing)) existing = [existing];
    } catch {
      // File doesn't exist yet — start fresh
    }

    existing.push({
      timestamp: new Date().toISOString(),
      runId: runMeta.runId || null,
      outcome: runMeta.refreshOutcome || 'unknown',
      durationMs: runMeta.durationMs || 0,
      requests: runMeta.requests || 0,
      ...metrics
    });

    await writeFile(file, JSON.stringify(existing, null, 2));
  } catch (err) {
    warn('quality_report_write_failed', { message: err.message });
  }
}

/**
 * Load the most recent quality report file from the data directory.
 * Returns the last entry in the most recent day file, or null.
 */
export async function loadLatestQualityReport() {
  try {
    const files = await readdir(DATA_DIR);
    const qualityFiles = files
      .filter((f) => f.startsWith('quality-') && f.endsWith('.json'))
      .sort()
      .reverse();
    if (!qualityFiles.length) return null;
    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(path.join(DATA_DIR, qualityFiles[0]), 'utf8');
    const entries = JSON.parse(raw);
    return Array.isArray(entries) ? entries[entries.length - 1] : entries;
  } catch {
    return null;
  }
}
