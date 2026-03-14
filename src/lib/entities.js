/**
 * entities.js — Entity extraction for The UnderCurrent intelligence pipeline.
 *
 * Two-tier approach:
 *  1. Pattern-based: fast, zero-cost extraction of tickers, known countries, major orgs.
 *  2. AI-based (Claude): semantic extraction of people and less-obvious orgs — used only
 *     for the top N stories per refresh to control cost.
 *
 * Returns: { people: string[], orgs: string[], countries: string[], tickers: string[] }
 */

import { aiComplete } from './ai.js';
import { warn } from './logger.js';

// ─── Pattern-based dictionaries ─────────────────────────────────────────────

const TICKER_RE = /\b([A-Z]{2,5})\b/g;
const WELL_KNOWN_TICKERS = new Set([
  'AAPL','MSFT','GOOGL','GOOG','AMZN','META','TSLA','NVDA','JPM','GS','MS',
  'BAC','WFC','C','BRK','JNJ','PFE','UNH','CVX','XOM','WMT','HD','COST',
  'SPY','QQQ','DIA','GLD','SLV','TLT','BTC','ETH','EUR','GBP','JPY','CNY',
  'IMF','WHO','NATO','OPEC','WTO','ECB','FED','BIS'
]);

const COUNTRIES = new Set([
  'united states','us','usa','america','china','russia','ukraine','israel','iran',
  'saudi arabia','india','pakistan','germany','france','uk','britain','japan',
  'south korea','north korea','taiwan','brazil','mexico','canada','australia',
  'turkey','egypt','nigeria','indonesia','vietnam','poland','hungary',
  'european union','eu','nato','g7','g20','brics'
]);

const MAJOR_ORGS = new Set([
  'federal reserve','fed','imf','world bank','united nations','un','nato','opec',
  'european central bank','ecb','sec','fbi','cia','pentagon','white house',
  'congress','senate','supreme court','state department','treasury','doj',
  'nsa','dhs','fda','cdc','who','world trade organization','wto',
  'apple','microsoft','google','amazon','meta','tesla','nvidia','openai',
  'goldman sachs','jp morgan','blackrock','berkshire hathaway',
  'elon musk','donald trump','joe biden','xi jinping','vladimir putin',
  'janet yellen','jerome powell','antony blinken'
]);

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fast, synchronous entity extraction using pattern matching.
 * Run this on every story — zero API cost.
 */
export function extractEntitiesSync(headline, summary = '', existingTopics = []) {
  const text = `${headline} ${summary}`.toLowerCase();
  const rawText = `${headline} ${summary}`;

  const tickers = extractTickers(rawText);
  const countries = extractCountries(text);
  const orgs = extractKnownOrgs(text);

  return { people: [], orgs, countries, tickers };
}

/**
 * AI-powered entity extraction — more accurate but has API cost.
 * Only call this for the top stories (e.g. top 10 per refresh).
 * Returns null on failure, falling back to sync results.
 */
export async function extractEntitiesAI(headline, summary = '') {
  const textSample = `${headline}. ${summary}`.slice(0, 500);

  const prompt = `Extract named entities from this news text. Return a JSON object with these keys:
- "people": array of full names of specific people mentioned (max 5)
- "orgs": array of organization/company names (max 5)
- "countries": array of country or region names (max 5)
- "tickers": array of stock/asset tickers like AAPL, BTC, EUR (max 5)

Text: "${textSample}"

Rules:
- Only include entities explicitly mentioned in the text
- Normalize names (e.g. "U.S." → "United States", "Fed" → "Federal Reserve")
- Return empty arrays if nothing found
- Return ONLY valid JSON, no commentary

Example: {"people":["Jerome Powell"],"orgs":["Federal Reserve"],"countries":["United States"],"tickers":["USD"]}`;

  const raw = await aiComplete(prompt, { maxTokens: 120 });
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim());
    return {
      people: Array.isArray(parsed.people) ? parsed.people.slice(0, 5) : [],
      orgs: Array.isArray(parsed.orgs) ? parsed.orgs.slice(0, 5) : [],
      countries: Array.isArray(parsed.countries) ? parsed.countries.slice(0, 5) : [],
      tickers: Array.isArray(parsed.tickers) ? parsed.tickers.slice(0, 5) : []
    };
  } catch {
    warn('entity_parse_failed', { raw: raw.slice(0, 100) });
    return null;
  }
}

/**
 * Merge sync and AI entity results, deduplicating.
 */
export function mergeEntities(sync, ai) {
  if (!ai) return sync;
  return {
    people: dedupeLower([...sync.people, ...ai.people]),
    orgs: dedupeLower([...sync.orgs, ...ai.orgs]),
    countries: dedupeLower([...sync.countries, ...ai.countries]),
    tickers: dedupeLower([...sync.tickers, ...ai.tickers])
  };
}

/**
 * Compute entity overlap score between two entity objects.
 * Used to boost clustering similarity when stories share entities.
 * Returns a value between 0 and 1.
 */
export function entityOverlapScore(entitiesA, entitiesB) {
  if (!entitiesA || !entitiesB) return 0;
  const allKeys = ['people', 'orgs', 'countries', 'tickers'];
  let matched = 0;
  let total = 0;

  for (const key of allKeys) {
    const a = new Set((entitiesA[key] || []).map((v) => v.toLowerCase()));
    const b = new Set((entitiesB[key] || []).map((v) => v.toLowerCase()));
    for (const val of a) {
      total += 1;
      if (b.has(val)) matched += 1;
    }
    for (const val of b) {
      if (!a.has(val)) total += 1;
    }
  }

  return total === 0 ? 0 : matched / total;
}

// ─── Private helpers ─────────────────────────────────────────────────────────

function extractTickers(text) {
  const found = new Set();
  let match;
  while ((match = TICKER_RE.exec(text)) !== null) {
    if (WELL_KNOWN_TICKERS.has(match[1])) found.add(match[1]);
  }
  return Array.from(found);
}

function extractCountries(lowerText) {
  const found = new Set();
  for (const country of COUNTRIES) {
    if (lowerText.includes(country)) {
      // Normalize to title case
      found.add(country.replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  }
  return Array.from(found);
}

function extractKnownOrgs(lowerText) {
  const found = new Set();
  for (const org of MAJOR_ORGS) {
    if (lowerText.includes(org)) {
      found.add(org.replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  }
  return Array.from(found);
}

function dedupeLower(arr) {
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}
