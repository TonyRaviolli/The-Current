import { slugify, stableId } from './normalize.js';
import { generateBrief, generateWhyItMatters, generateWhatsNext, classifyTopicsBatch } from './ai.js';
import { extractEntitiesSync, extractEntitiesAI, mergeEntities } from './entities.js';

const ORIENTATION_META = {
  left: { label: 'Left', color: '#4a90d9' },
  'center-left': { label: 'Ctr-L', color: '#6eb5ff' },
  center: { label: 'Center', color: '#a0a0a0' },
  'center-right': { label: 'Ctr-R', color: '#e8923a' },
  right: { label: 'Right', color: '#d45454' },
  state: { label: 'State', color: '#8f6a21' }
};

const TOPIC_RULES = {
  finance: ['finance', 'bank', 'credit', 'debt', 'bond', 'equity', 'ipo', 'earnings', 'liquidity'],
  macroeconomics: ['inflation', 'gdp', 'recession', 'cpi', 'ppi', 'jobs', 'labor market', 'growth', 'rate cut'],
  energy: ['oil', 'gas', 'lng', 'opec', 'refinery', 'grid', 'power', 'renewable', 'solar', 'wind'],
  defense: ['defense', 'military', 'missile', 'navy', 'air force', 'cyber command', 'deterrence'],
  law: ['court', 'supreme court', 'lawsuit', 'settlement', 'regulation', 'compliance', 'ruling'],
  ai: ['ai', 'artificial intelligence', 'llm', 'model', 'inference', 'chip', 'agentic'],
  biotech: ['biotech', 'clinical', 'trial', 'fda', 'gene', 'therapy', 'pharma', 'drug'],
  cyber: ['cyber', 'ransomware', 'breach', 'zero-day', 'vulnerability', 'exploit', 'malware'],
  infrastructure: ['infrastructure', 'bridge', 'port', 'rail', 'construction', 'utilities', 'supply chain'],
  climate: ['climate', 'emissions', 'carbon', 'temperature', 'wildfire', 'flood', 'drought'],
  global_trade: ['tariff', 'trade', 'export', 'import', 'shipping', 'customs', 'sanctions'],
  elections: ['election', 'primary', 'ballot', 'campaign', 'voter', 'polling', 'debate'],
  labor: ['union', 'strike', 'wage', 'employment', 'layoff', 'worker', 'collective bargaining'],
  housing: ['housing', 'mortgage', 'home price', 'rent', 'real estate', 'construction starts'],
  education: ['education', 'school', 'university', 'student debt', 'curriculum', 'tuition'],
  geopolitics: ['geopolitics', 'diplomatic', 'ceasefire', 'border', 'treaty', 'summit', 'foreign ministry'],
  uspolitics: ['congress', 'senate', 'house', 'white house', 'governor', 'state department'],
  economy: ['economy', 'economic', 'market', 'stocks', 'rates', 'treasury', 'federal reserve'],
  health: ['health', 'hospital', 'public health', 'disease', 'cdc', 'who', 'outbreak'],
  tech: ['technology', 'software', 'hardware', 'cloud', 'semiconductor', 'platform', 'startup'],
  science: ['science', 'research', 'study', 'nasa', 'breakthrough', 'experiment'],
  engineering: ['engineering', 'manufacturing', 'robotics', 'design', 'industrial'],
  banking: ['central bank', 'interest rate', 'monetary policy', 'fed funds', 'quantitative easing', 'balance sheet', 'deposit', 'lending', 'fdic', 'bis', 'bank of england', 'ecb', 'boj', 'reserve'],
  international: ['international', 'foreign', 'bilateral', 'multilateral', 'embassy', 'consul', 'sanctions', 'united nations', 'nato', 'g7', 'g20']
};

const TOPIC_ALIASES = {
  ai: 'AI',
  uspolitics: 'U.S. Politics',
  global_trade: 'Global Trade',
  macroeconomics: 'Macroeconomics',
  banking: 'Central Banking',
  international: 'International'
};

/**
 * Build story objects from clusters. Returns a sorted array of story objects.
 * This is intentionally synchronous — AI enrichment happens in enrichStories().
 */
export function buildStories(clusters = [], options = {}) {
  const baseUrl = options.baseUrl || '';
  return clusters.map((cluster) => {
    const lead = cluster.lead;
    const id = stableId([cluster.id, lead.title]);
    const slug = `${slugify(lead.title).slice(0, 64)}-${cluster.id.slice(0, 4)}`;
    const sources = uniqueSources(cluster.items);
    const classifier = classifyTopicsKeyword(cluster.items);
    const topics = classifier.topics;
    const topicConfidence = classifier.confidence;
    const updatedAt = cluster.updatedAt;
    const verificationTier = deriveVerification(sources);
    const confidenceScore = deriveConfidence(sources.length, updatedAt);
    const confidenceLabel = `${Math.round(confidenceScore * 100)}%`;
    const primaryDocs = collectPrimaryDocs(cluster.items, lead);

    const entities = extractEntitiesSync(lead.title, lead.summary, classifier.topics);
    const regions = Array.from(new Set(cluster.items.map((item) => item.region).filter(Boolean))).slice(0, 6);

    // Pick the first available image URL from any item in the cluster
    const imageUrl = cluster.items.map((i) => i.imageUrl).find(Boolean) || null;
    // Cartoon if any source in the cluster is a cartoon source
    const contentType = cluster.items.some((i) => i.contentType === 'cartoon') ? 'cartoon' : 'article';

    return {
      id,
      slug,
      headline: lead.title,
      dek: lead.summary || '',
      url: lead.url,
      source: lead.source,
      tier: lead.tier,
      score: lead.score,
      scoreBreakdown: lead.scoreBreakdown,
      publishedAt: lead.publishedAt,
      updatedAt,
      topics,
      topicConfidence,
      entities,
      regions,
      sources,
      verificationTier,
      confidence: confidenceScore,
      confidenceLabel,
      spectrum: buildSpectrum(sources),
      timeline: buildTimeline(cluster.items),
      whyItMatters: buildWhyItMattersSync(lead, topics),
      whatsNext: buildWhatsNextSync(lead, topics),
      primaryDocs,
      related: [],
      corrections: [],
      developing: isDeveloping(cluster.items),
      canonicalUrl: baseUrl ? `${baseUrl}/story/${slug}` : `/story/${slug}`,
      imageUrl,
      contentType,
      _clusterItems: cluster.items
    };
  }).sort((a, b) => b.score - a.score || b.updatedAt.localeCompare(a.updatedAt));
}

/**
 * Async AI enrichment pass over already-built stories.
 * - Enriches top 10 stories only (reduced from 20) to cut token usage.
 * - Skips stories already enriched within 24h (cache by ID from previous run).
 * - Uses a single batch topic-classification call for all candidates.
 *
 * @param {object[]} stories
 * @param {Map<string,object>} [prevById] — map of id→story from the previous store, for cache hits
 */
export async function enrichStories(stories, prevById = new Map()) {
  const ENRICH_LIMIT = 10;
  const CACHE_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Separate stories that already have fresh AI enrichment
  const toEnrich = [];
  for (const story of stories.slice(0, ENRICH_LIMIT)) {
    const prev = prevById.get(story.id);
    // Issue 9: skip re-enrichment if previously enriched AND updatedAt hasn't changed
    const freshEnrich = prev?._enrichedAt && now - new Date(prev._enrichedAt).getTime() < CACHE_MS;
    const storyUpdated = story.updatedAt && prev?.updatedAt && story.updatedAt !== prev.updatedAt;
    if (freshEnrich && !storyUpdated) {
      // Reuse cached AI fields
      story.whyItMatters = prev.whyItMatters ?? story.whyItMatters;
      story.whatsNext = prev.whatsNext ?? story.whatsNext;
      if (prev.topics?.length) {
        story.topics = prev.topics;
        story.topicConfidence = prev.topicConfidence ?? story.topicConfidence;
      }
      story._enrichedAt = prev._enrichedAt;
    } else {
      toEnrich.push(story);
    }
  }

  if (!toEnrich.length) {
    for (const story of stories) delete story._clusterItems;
    return stories;
  }

  // Batch topic classification — one API call for all candidates
  const batchInputs = toEnrich.map((story) => {
    const items = story._clusterItems || [];
    return {
      headline: story.headline,
      summaries: items.map((item) => item.summary || '').filter(Boolean),
      existingTopics: items.flatMap((item) => item.topics || [])
    };
  });

  const batchTopics = await classifyTopicsBatch(batchInputs);

  // Apply batch topics + run why/next + entity extraction concurrently per story
  await Promise.all(toEnrich.map(async (story, i) => {
    const items = story._clusterItems || [];
    const aiTopics = batchTopics[i] || null;

    const [whyItMatters, whatsNext, aiEntities] = await Promise.all([
      generateWhyItMatters(story.headline, story.dek, story.topics),
      generateWhatsNext(story.headline, story.topics),
      extractEntitiesAI(story.headline, story.dek)
    ]);

    if (aiTopics?.length) {
      story.topics = aiTopics;
      story.topicConfidence = classifyTopicsKeyword(items, aiTopics).confidence;
    }
    if (whyItMatters) story.whyItMatters = whyItMatters;
    if (whatsNext) story.whatsNext = whatsNext;
    if (aiEntities) story.entities = mergeEntities(story.entities || {}, aiEntities);
    story._enrichedAt = new Date().toISOString();
  }));

  // Strip internal-only field
  for (const story of stories) delete story._clusterItems;

  return stories;
}

/**
 * Build executive intelligence brief. Tries Claude first, falls back to
 * the keyword-based version so the pipeline never returns empty.
 */
export async function buildBrief(stories = []) {
  if (!stories.length) {
    return {
      lead: 'No new stories were confirmed in this run. Retaining last verified briefing while sources are checked again.',
      bullets: [
        'Primary feeds returned limited new items in this run.',
        'Use Refresh to force another pass and re-check source availability.',
        'Archive and Topics remain available for recent verified coverage.'
      ]
    };
  }

  const aiBrief = await generateBrief(stories);
  if (aiBrief) return aiBrief;

  // Keyword fallback
  return buildBriefSync(stories);
}

export function buildTopicBlocks(stories = []) {
  const map = new Map();
  for (const story of stories) {
    const topic = story.topics?.[0];
    if (!topic) continue;
    if (!map.has(topic)) map.set(topic, []);
    map.get(topic).push(story);
  }
  return Array.from(map.entries()).slice(0, 6).map(([topic, items]) => ({
    topic,
    label: toTitle(topic),
    items: items.slice(0, 4)
  }));
}

export function buildWeeklyDigest(stories = []) {
  if (!stories.length) return null;
  const top10 = stories.slice(0, 10);
  const marketRecap = stories.filter((s) => s.topics.includes('economy') || s.topics.includes('markets') || s.topics.includes('finance')).slice(0, 5);
  const policyRecap = stories.filter((s) => s.topics.includes('uspolitics') || s.topics.includes('law') || s.topics.includes('elections')).slice(0, 5);
  return {
    key: 'latest',
    label: 'Latest Digest',
    summary: `Top ${top10.length} verified stories ranked by systemic impact, urgency, and source strength.`,
    top10,
    marketRecap,
    policyRecap
  };
}

// ─── Private helpers ─────────────────────────────────────────────────────────

function classifyTopicsKeyword(items, aiTopicsHint = []) {
  const tally = new Map();
  const text = items
    .map((item) => `${item.title || ''} ${item.summary || ''} ${(item.topics || []).join(' ')}`.toLowerCase())
    .join(' ');

  // AI topic hints get highest weight
  aiTopicsHint.forEach((topic) => tally.set(topic, (tally.get(topic) || 0) + 5));

  // Source-declared topics
  (items.flatMap((item) => item.topics || [])).forEach((topic) => {
    tally.set(topic, (tally.get(topic) || 0) + 2);
  });

  // Keyword matching
  for (const [topic, keywords] of Object.entries(TOPIC_RULES)) {
    let score = tally.get(topic) || 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) score += 1;
    }
    if (score > 0) tally.set(topic, score);
  }

  const sorted = Array.from(tally.entries()).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, score]) => sum + score, 0) || 1;
  const topics = sorted.slice(0, 4).map(([topic]) => topic);
  const confidence = sorted.slice(0, 6).map(([topic, score]) => ({
    topic,
    label: TOPIC_ALIASES[topic] || toTitle(topic),
    confidence: Math.min(0.99, score / total)
  }));

  return { topics: topics.length ? topics : ['geopolitics'], confidence };
}

function buildBriefSync(stories) {
  const today = new Date().toISOString().slice(0, 10);
  const todayStories = stories.filter((s) => String(s.publishedAt || '').slice(0, 10) === today);
  const pool = todayStories.length >= 3 ? todayStories : stories;
  const sorted = [...pool].sort((a, b) => (b.score || 0) - (a.score || 0));
  const top = sorted[0];
  if (!top) return { lead: 'No stories available at this time.', bullets: [] };

  const topHeadline = top.headline || top.dek || 'Breaking developments';
  const topWhy = top.whyItMatters
    ? top.whyItMatters.split(' ').slice(0, 25).join(' ') + (top.whyItMatters.split(' ').length > 25 ? '\u2026' : '')
    : 'Multiple sources are tracking this as today\'s highest-priority development.';
  const topNext = top.whatsNext || 'Confirmation across Tier 1 sources expected in the next 12\u201324 hours.';

  const lead = `${topHeadline}. ${topWhy}`;

  const bullets = [];
  bullets.push(`What's new: ${topHeadline}`);
  bullets.push(`Why it matters: ${topWhy}`);
  bullets.push(`Watch for: ${topNext}`);

  const marketStory = sorted.find((s) => s.topics?.some((t) => ['economy', 'finance', 'macroeconomics', 'markets', 'global_trade'].includes(t)));
  const policyStory = sorted.find((s) => s.topics?.some((t) => ['uspolitics', 'law', 'elections', 'labor'].includes(t)));
  const geoStory    = sorted.find((s) => s.topics?.some((t) => ['geopolitics', 'defense', 'international'].includes(t)));

  if (marketStory && marketStory.id !== top.id) bullets.push(`Market angle: ${marketStory.headline || marketStory.dek}`);
  else if (policyStory && policyStory.id !== top.id) bullets.push(`Policy angle: ${policyStory.headline || policyStory.dek}`);
  else if (geoStory && geoStory.id !== top.id) bullets.push(`Geopolitical angle: ${geoStory.headline || geoStory.dek}`);

  return { lead, bullets };
}

function buildWhyItMattersSync(lead, topics) {
  if (topics.includes('economy') || topics.includes('finance')) return 'Market-moving developments with broad implications for rates, pricing, and capital allocation.';
  if (topics.includes('geopolitics') || topics.includes('global_trade')) return 'Strategic shifts that influence alliances, trade corridors, and national security posture.';
  if (topics.includes('tech') || topics.includes('ai')) return 'Signals that shape capability, regulation, and competitive positioning in technology.';
  return lead.summary || 'This story meaningfully alters near-term decisions for operators, policymakers, and investors.';
}

function buildWhatsNextSync(lead, topics) {
  if (topics.includes('uspolitics') || topics.includes('law')) return 'Watch for legislative text changes, committee movement, and agency implementation timelines.';
  if (topics.includes('health') || topics.includes('biotech')) return 'Monitor regulatory actions, trial updates, and procurement signals over the next 24-72 hours.';
  return 'Expect follow-on confirmations and second-order effects across markets and policy channels in the next 24-72 hours.';
}

function uniqueSources(items) {
  const map = new Map();
  for (const item of items) {
    if (!map.has(item.sourceId)) {
      map.set(item.sourceId, {
        id: item.sourceId,
        name: item.source,
        tier: item.tier,
        tierLabel: `Tier ${item.tier}`,
        orientation: item.orientation || 'center',
        sourceType: item.sourceType || 'secondary'
      });
    }
  }
  return Array.from(map.values());
}

function buildTimeline(items) {
  return items
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 6)
    .map((item) => ({
      title: item.title,
      publishedAt: item.publishedAt,
      source: item.source,
      url: item.url
    }));
}

function buildSpectrum(sources) {
  const counts = {};
  sources.forEach((source) => {
    const key = source.orientation || 'center';
    counts[key] = (counts[key] || 0) + 1;
  });
  const total = sources.length || 1;
  return Object.entries(ORIENTATION_META).map(([key, meta]) => ({
    label: meta.label,
    color: meta.color,
    count: counts[key] || 0,
    percent: Math.round(((counts[key] || 0) / total) * 100)
  }));
}

function collectPrimaryDocs(items, lead) {
  const docs = [];
  const seen = new Set();
  const billIds = extractBillIds(`${lead.title || ''} ${lead.summary || ''}`);

  for (const item of items) {
    if (!item?.url) continue;
    if (item.sourceType === 'primary' || isGovernmentUrl(item.url)) {
      const key = item.url;
      if (seen.has(key)) continue;
      seen.add(key);
      docs.push({
        title: item.title || item.source || 'Primary document',
        url: item.url,
        label: isGovernmentUrl(item.url) ? 'Government source' : 'Primary source'
      });
    }
  }

  for (const billId of billIds) {
    const url = buildCongressSearchUrl(billId);
    if (seen.has(url)) continue;
    seen.add(url);
    docs.push({
      title: `${billId} on Congress.gov`,
      url,
      label: 'Bill text / status'
    });
  }

  if (!billIds.length && looksLikeLegislation(`${lead.title || ''} ${lead.summary || ''}`)) {
    const searchText = `${lead.title || ''}`.replace(/[("'`)]/g, '').trim();
    const url = buildCongressSearchUrl(searchText);
    if (!seen.has(url)) {
      seen.add(url);
      docs.push({
        title: `${searchText.slice(0, 80)} on Congress.gov`,
        url,
        label: 'Congress search'
      });
    }
  }

  return docs.slice(0, 6);
}

function isGovernmentUrl(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname.endsWith('.gov') || hostname === 'govinfo.gov' || hostname === 'federalregister.gov';
  } catch {
    return false;
  }
}

function extractBillIds(text = '') {
  const matches = text.match(/\b(?:H\.?\s?R\.?|S\.?|H\.?\s?J\.?\s?Res\.?|S\.?\s?J\.?\s?Res\.?)\s?\d+\b/gi) || [];
  return Array.from(new Set(matches.map((match) => match.replace(/\s+/g, ' ').replace(/\bH\s+R\b/i, 'H.R.').replace(/\bS\b/i, 'S.').trim())));
}

function buildCongressSearchUrl(billId) {
  return `https://www.congress.gov/search?q=${encodeURIComponent(JSON.stringify({ source: 'legislation', search: billId }))}`;
}

function looksLikeLegislation(text = '') {
  return /\b(bill|act|resolution|appropriation|appropriations|legislation|senate bill|house bill|measure)\b/i.test(text);
}

function deriveVerification(sources) {
  if (sources.some((s) => s.sourceType === 'primary')) return 'Primary';
  if (sources.length >= 2) return 'Multi-source';
  return 'Single-source';
}

function deriveConfidence(sourceCount, updatedAt) {
  const recencyHours = (Date.now() - new Date(updatedAt).getTime()) / 3600000;
  const recencyScore = Math.max(0, 1 - recencyHours / 48);
  const sourceScore = Math.min(1, 0.3 + sourceCount * 0.15);
  return Math.min(1, 0.4 + sourceScore * 0.4 + recencyScore * 0.3);
}

function isDeveloping(items) {
  const recent = items.some((item) => (Date.now() - new Date(item.publishedAt).getTime()) < 12 * 3600000);
  return items.length >= 2 && recent;
}

function toTitle(value) {
  return value.replace(/(^|\s|_)([a-z])/g, (_, sep, char) => `${sep}${char.toUpperCase()}`).replace(/_/g, ' ').trim();
}
