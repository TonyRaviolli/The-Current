/**
 * topics.js — Canonical allowed-topic list for The UnderCurrent pipeline.
 *
 * Single source of truth consumed by:
 *  - src/lib/ai.js   (classifyTopicsAI, classifyTopicsBatch)
 *  - src/lib/story.js (TOPIC_RULES uses these keys)
 *
 * Issue 10: extracted from duplicated inline arrays.
 */

export const ALLOWED_TOPICS = [
  'finance', 'macroeconomics', 'energy', 'defense', 'law', 'ai', 'biotech',
  'cyber', 'infrastructure', 'climate', 'global_trade', 'elections', 'labor',
  'housing', 'education', 'geopolitics', 'uspolitics', 'economy', 'health',
  'tech', 'science', 'engineering', 'local', 'banking', 'international'
];
