/**
 * ai.js — Claude API wrapper for The UnderCurrent intelligence pipeline.
 *
 * Provides async helpers used by story.js and other pipeline modules.
 * Falls back gracefully when ANTHROPIC_API_KEY is not set, so the pipeline
 * never hard-fails due to a missing key.
 */

import Anthropic from '@anthropic-ai/sdk';
import { warn } from './logger.js';
import { ALLOWED_TOPICS } from '../../config/topics.js';

const MODEL = 'claude-opus-4-6';
const MAX_TOKENS_DEFAULT = 256;
const MAX_TOKENS_BRIEF = 500;

let _client = null;
let _missingKeyWarned = false;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

/**
 * Run a single prompt against Claude. Returns the text response or null if
 * the API key is missing or the call fails.
 */
export async function aiComplete(prompt, { maxTokens = MAX_TOKENS_DEFAULT, systemPrompt, useThinking = false } = {}) {
  const client = getClient();
  if (!client) {
    if (!_missingKeyWarned) {
      warn('ai_skipped', { reason: 'ANTHROPIC_API_KEY not set' });
      _missingKeyWarned = true;
    }
    return null;
  }

  try {
    const params = {
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    };
    if (useThinking) params.thinking = { type: 'adaptive' };
    if (systemPrompt) params.system = systemPrompt;

    const stream = await client.messages.stream(params);
    const final = await stream.finalMessage();
    const textBlock = final.content.find((b) => b.type === 'text');
    return textBlock?.text?.trim() || null;
  } catch (err) {
    // Issue 14: structured error type logging so failures are diagnosable
    const status = err.status || err.statusCode || null;
    let errorType = 'UNKNOWN';
    if (status === 429 || /rate.?limit/i.test(err.message)) errorType = 'RATE_LIMIT';
    else if (status === 401 || /auth|key/i.test(err.message)) errorType = 'AUTH';
    else if (status === 529 || /overload/i.test(err.message)) errorType = 'OVERLOAD';
    else if (status >= 500) errorType = 'SERVER_ERROR';
    else if (/timeout|ETIMEDOUT/i.test(err.message)) errorType = 'TIMEOUT';
    process.stderr.write(`[ai:complete] ${errorType} status=${status} ${err.message}\n`);
    warn('ai_error', { type: errorType, status, message: err.message });
    return null;
  }
}

/**
 * Generate an executive intelligence brief from ranked stories.
 * Returns { lead, bullets } — matching the shape expected by the frontend.
 */
export async function generateBrief(stories) {
  if (!stories.length) return null;

  const top = stories.slice(0, 5);
  const storyLines = top.map((s, i) =>
    `${i + 1}. [${s.topics.slice(0, 2).join('/')}] ${s.headline} (sources: ${s.sources?.length || 1})`
  ).join('\n');

  const prompt = `You are an intelligence analyst writing a daily executive briefing for decision-makers.

Given these ranked stories from today's feeds:

${storyLines}

Write a concise executive brief with:
1. A single "lead" sentence (max 40 words) identifying the highest-impact development and why it matters now.
2. Exactly 3-4 "bullets" (each max 20 words) covering market, policy, geopolitical, or tech angles from the stories above. Each bullet must reference a real story.

Respond in this exact JSON format:
{
  "lead": "...",
  "bullets": ["...", "...", "..."]
}

No commentary outside the JSON.`;

  const raw = await aiComplete(prompt, { maxTokens: MAX_TOKENS_BRIEF, useThinking: true });
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim());
    if (typeof parsed.lead === 'string' && Array.isArray(parsed.bullets)) {
      return { lead: parsed.lead, bullets: parsed.bullets.slice(0, 5) };
    }
  } catch {
    warn('ai_brief_parse_failed', { raw: raw.slice(0, 200) });
  }
  return null;
}

/**
 * Generate "why it matters" for a story given its headline, summary, and topics.
 * Returns a plain string, or null on failure.
 */
export async function generateWhyItMatters(headline, summary, topics) {
  const prompt = `You are an intelligence analyst. In exactly 1 sentence (max 30 words), explain why this story matters to policymakers, investors, or operators right now.

Headline: ${headline}
Summary: ${summary || '(no summary)'}
Topics: ${topics.join(', ')}

Return only the sentence, no preamble.`;

  return aiComplete(prompt, { maxTokens: 80 });
}

/**
 * Generate "what to watch next" for a story.
 * Returns a plain string, or null on failure.
 */
export async function generateWhatsNext(headline, topics) {
  const prompt = `You are an intelligence analyst. In exactly 1 sentence (max 30 words), describe the most important signal to watch for in the next 24–72 hours related to this story.

Headline: ${headline}
Topics: ${topics.join(', ')}

Return only the sentence, no preamble.`;

  return aiComplete(prompt, { maxTokens: 80 });
}

/**
 * Generate a market intelligence assessment from market/economy stories.
 * Returns { pulse, regime, summary, signals } or null on failure.
 */
export async function generateMarketIntelligence(marketStories) {
  if (marketStories.length < 3) return null;

  const storyLines = marketStories.slice(0, 6).map((s, i) =>
    `${i + 1}. ${s.headline}${s.dek ? ` — ${s.dek}` : ''}`
  ).join('\n');

  const prompt = `You are a market intelligence analyst. Based on these current market and economic stories, assess the current market environment.

Stories:
${storyLines}

Return a JSON object with:
- "pulse": one of "Volatile", "Active", "Stable", "Subdued"
- "regime": one of "risk-on", "risk-off", "volatile", "stable"
- "summary": a single sentence (max 25 words) describing current market conditions
- "signals": array of exactly 3 short signal strings (max 8 words each) to watch

Example: {"pulse":"Volatile","regime":"risk-off","summary":"Credit markets tightening as inflation data surprises to the upside.","signals":["Fed rate decision Thursday","Treasury yield curve steepening","Equity volatility index elevated"]}

Return ONLY valid JSON, no commentary.`;

  const raw = await aiComplete(prompt, { maxTokens: 200 });
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim());
    const validPulses = ['Volatile', 'Active', 'Stable', 'Subdued'];
    const validRegimes = ['risk-on', 'risk-off', 'volatile', 'stable'];
    return {
      pulse: validPulses.includes(parsed.pulse) ? parsed.pulse : 'Stable',
      regime: validRegimes.includes(parsed.regime) ? parsed.regime : 'stable',
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      signals: Array.isArray(parsed.signals) ? parsed.signals.slice(0, 3) : []
    };
  } catch {
    warn('market_intel_parse_failed', { raw: raw.slice(0, 100) });
    return null;
  }
}

/**
 * Batch-classify topics for multiple stories in a single API call.
 * @param {Array<{headline: string, summaries: string[], existingTopics: string[]}>} items
 * @returns {Promise<Array<string[]|null>>} — one entry per input item, or null on failure
 */
export async function classifyTopicsBatch(items) {
  if (!items.length) return [];

  const lines = items.map((s, i) => {
    const text = [s.headline, ...s.summaries.slice(0, 2)].join(' ').slice(0, 300);
    const hint = s.existingTopics.length ? ` [hints: ${s.existingTopics.slice(0, 2).join(',')}]` : '';
    return `${i + 1}. "${text}"${hint}`;
  }).join('\n');

  const prompt = `Classify each numbered news item into 1–4 topics from: ${ALLOWED_TOPICS.join(', ')}

${lines}

Return a JSON array, one entry per item (array of topic strings).
Example: [["economy","geopolitics"],["tech","ai"]]
No commentary.`;

  const raw = await aiComplete(prompt, { maxTokens: items.length * 25 + 40 });
  if (!raw) return items.map(() => null);

  try {
    const arr = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim());
    if (!Array.isArray(arr)) return items.map(() => null);
    return arr.map((topics) => {
      if (!Array.isArray(topics)) return null;
      const valid = topics.filter((t) => ALLOWED_TOPICS.includes(t));
      return valid.length ? valid.slice(0, 4) : null;
    });
  } catch {
    return items.map(() => null);
  }
}

/**
 * Classify topics for a cluster of articles using semantic understanding.
 * Returns an array of topic strings (from the allowed topic list).
 * Note: ALLOWED_TOPICS is imported from config/topics.js (Issue 10).
 */
export async function classifyTopicsAI(headline, summaries, existingTopics) {
  const textSample = [headline, ...summaries.slice(0, 3)].join(' ').slice(0, 600);
  const hint = existingTopics.length ? `Source hints: ${existingTopics.join(', ')}.` : '';

  const prompt = `Classify this news content into 1–4 topics from this exact list:
${ALLOWED_TOPICS.join(', ')}

${hint}
Text: "${textSample}"

Return only a JSON array of topic strings, e.g. ["economy","geopolitics"]. Choose the most specific and relevant topics. No commentary.`;

  const raw = await aiComplete(prompt, { maxTokens: 60 });
  if (!raw) return null;

  try {
    const arr = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim());
    if (Array.isArray(arr)) {
      const valid = arr.filter((t) => ALLOWED_TOPICS.includes(t));
      return valid.length ? valid.slice(0, 4) : null;
    }
  } catch {
    // fall through
  }
  return null;
}
