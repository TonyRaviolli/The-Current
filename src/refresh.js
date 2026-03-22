import { readFile, writeFile } from 'node:fs/promises';
import { loadJson, saveJson } from './lib/store.js';
import { fetchSourceItems } from './lib/source-adapters.js';
import { normalizeUrl, stableId } from './lib/normalize.js';
import { dedupeArticles } from './lib/dedupe.js';
import { scoreArticle, isHighImportance } from './lib/score.js';
import { safeText } from './lib/sanitize.js';
import { selectDailyInsight } from './lib/quotes.js';
import { info, warn, error } from './lib/logger.js';
import { writeRobots, writeSitemap, writeSiteFeed } from './site.js';
import { clusterArticles } from './lib/cluster.js';
import { buildStories, enrichStories, buildBrief, buildTopicBlocks, buildWeeklyDigest } from './lib/story.js';
import { generateMarketIntelligence } from './lib/ai.js';
import { buildDigestEmail } from './lib/digest.js';
import { buildHealthSummary } from './lib/health.js';
import { computeQualityMetrics, writeQualityReport } from './lib/metrics.js';
import { appendToArchive, loadArchive } from './lib/archive.js';
import { normalizeTitle, jaccardSimilarity } from './lib/normalize.js';

const DATA_DIR = process.env.DATA_DIR || './data';
const STORE_PATH = `${DATA_DIR}/store.json`;
const CACHE_PATH = `${DATA_DIR}/cache.json`;
const HEALTH_PATH = `${DATA_DIR}/health.json`;

export async function refreshOnce(options = {}) {
  const force = Boolean(options.force);
  const startedAt = Date.now();
  const sourcesConfig = JSON.parse(await readFile(new URL('../config/sources.json', import.meta.url)));
  const refreshConfig = JSON.parse(await readFile(new URL('../config/refresh.json', import.meta.url)));
  const cache = await loadJson(CACHE_PATH, { sources: {}, articles: {} });
  const store = await loadJson(STORE_PATH, { daily: [], highImportance: [], weeklyDigests: [], topics: [], stories: [] });
  const healthStore = await loadJson(HEALTH_PATH, {});
  const archiveStore = await loadArchive(DATA_DIR);

  const budget = { ...refreshConfig.budget };
  const requestedIds = new Set((options.sourceIds || []).map((id) => String(id)));
  const requestedTier = options.tier != null ? Number(options.tier) : null;
  if (typeof options.maxSources === 'number' && options.maxSources > 0) {
    budget.maxSources = Math.min(options.maxSources, budget.maxRequests);
  }
  const metrics = { sourcesChecked: 0, articlesIngested: 0, requests: 0, clustersCreated: 0, durationMs: 0 };
  const sources = Object.values(sourcesConfig.tiers)
    .flat()
    .filter((s) => s.enabled)
    .filter((s) => !requestedIds.size || requestedIds.has(s.id))
    .filter((s) => requestedTier == null || Number(s.tier) === requestedTier);
  const maxSources = Math.min(budget.maxSources, sources.length);
  const cursor = Number(cache.meta?.sourceCursor || 0) % Math.max(1, sources.length);
  const rotated = sources.slice(cursor).concat(sources.slice(0, cursor));
  const limitedSources = requestedIds.size || requestedTier != null ? rotated : rotated.slice(0, maxSources);
  info('refresh_window', { force, sourcePool: sources.length, startCursor: cursor, selected: limitedSources.length });

  const collected = [];
  for (const source of limitedSources) {
    if (Date.now() - startedAt > budget.maxRunMs) {
      warn('budget_time_exceeded', { sourceId: source.id });
      break;
    }
    if (metrics.requests >= budget.maxRequests) {
      warn('budget_requests_exceeded', { sourceId: source.id });
      break;
    }

    try {
      const response = await fetchSourceItems(source, {
        cache,
        config: refreshConfig,
        force,
        healthStore
      });
      metrics.requests += response.requests || 1;
      metrics.sourcesChecked += 1;

      if (response.status === 304 || response.status === 0) continue;
      if (response.status < 200 || response.status >= 400) {
        warn('source_fetch_failed', { sourceId: source.id, status: response.status });
        continue;
      }

      const items = (response.items || []).slice(0, source.maxItems || 30);
      for (const item of items) {
        const url = normalizeUrl(item.link);
        const title = safeText(item.title);
        const summary = safeText(item.summary || '');
        if (!url || !title) continue;

        let publishedAt = new Date().toISOString();
        if (item.published) {
          try {
            const d = new Date(item.published);
            if (!isNaN(d.getTime())) publishedAt = d.toISOString();
          } catch { /* invalid date — fall back to now */ }
        }
        const id = stableId([source.id, url, title, publishedAt]);

        collected.push({
          id,
          title,
          summary,
          url,
          source: source.name,
          sourceId: source.id,
          tier: source.tier,
          topics: source.topics || [],
          region: source.region || null,
          publishedAt,
          orientation: source.orientation || 'center',
          sourceType: source.sourceType || (source.tier === 1 ? 'primary' : 'secondary'),
          contentType: source.contentType || 'article',
          imageUrl: item.imageUrl || null
        });
      }
    } catch (err) {
      error('source_error', { sourceId: source.id, message: err.message });
    }
  }

  metrics.durationMs = Date.now() - startedAt;

  if (!collected.length) {
    warn('no_articles_collected');
    info('refresh_no_updates', { selectedSources: limitedSources.length, requests: metrics.requests });
    // Never blank the store on a no-content run — retain last good state
    const noUpdateStore = {
      ...store,
      metrics: {
        ...(store.metrics || {}),
        ...metrics,
        note: 'No new items collected in this run.'
      },
      refreshOutcome: 'no_new_items',
      refreshAttemptAt: new Date().toISOString(),
      // Retain existing brief or fall back to a placeholder
      brief: store.brief || {
        lead: 'No new stories were ingested in this run. Existing verified stories are still available.',
        bullets: [
          'Source endpoints may have returned cached or unchanged responses.',
          'Trigger another refresh to force a broader source sweep.'
        ]
      }
    };
    if (!requestedIds.size && requestedTier == null) {
      cache.meta = { ...(cache.meta || {}), sourceCursor: (cursor + maxSources) % Math.max(1, sources.length) };
    }
    await saveJson(CACHE_PATH, cache);
    await saveJson(STORE_PATH, noUpdateStore);
    await saveJson(HEALTH_PATH, healthStore);
    return noUpdateStore;
  }

  const collectedCount = collected.length;
  metrics.articlesIngested = collectedCount;

  // Issue 17: per-phase timing instrumentation
  console.time('[refresh] fetch');
  console.timeEnd('[refresh] fetch');
  console.time('[refresh] dedup');
  info('pipeline_checkpoint', { phase: 'dedup', collected: collectedCount, memMB: Math.round(process.memoryUsage().rss / 1e6) });
  const { unique } = dedupeArticles(collected);
  console.timeEnd('[refresh] dedup');

  console.time('[refresh] score');
  const scored = unique.map((article) => {
    const { score, breakdown } = scoreArticle(article, refreshConfig.scoring, sourcesConfig.localRegion);
    return {
      ...article,
      score,
      scoreBreakdown: breakdown
    };
  });
  console.timeEnd('[refresh] score');

  const sorted = scored.sort((a, b) => b.score - a.score || b.publishedAt.localeCompare(a.publishedAt));
  const recent = sorted.filter((item) => withinHours(item.publishedAt, 72)).slice(0, 500);

  console.time('[refresh] cluster');
  info('pipeline_checkpoint', { phase: 'cluster', unique: unique.length, recent: recent.length, memMB: Math.round(process.memoryUsage().rss / 1e6) });
  const clusters = clusterArticles(recent, refreshConfig.clustering || {});
  const rawStories = buildStories(clusters, { baseUrl: process.env.BASE_URL || 'http://localhost:5173' });
  metrics.clustersCreated = clusters.length;
  console.timeEnd('[refresh] cluster');

  console.time('[refresh] enrich');
  info('pipeline_checkpoint', { phase: 'enrich', clusters: clusters.length, memMB: Math.round(process.memoryUsage().rss / 1e6) });

  // Build a cache map from the previous store so enrichStories can skip re-generation
  const prevById = new Map((store.stories || []).map((s) => [s.id, s]));

  // AI enrichment: classify topics, generate whyItMatters, whatsNext
  const stories = await enrichStories(rawStories, prevById);
  console.timeEnd('[refresh] enrich');
  info('pipeline_checkpoint', { phase: 'select', stories: stories.length, memMB: Math.round(process.memoryUsage().rss / 1e6) });

  linkRelatedStories(stories);
  const daily = selectDailyStories(stories, refreshConfig);
  const highImportance = selectHighImportanceStories(stories, refreshConfig);
  const topicPool = buildTopicPool(stories, archiveStore);
  const topics = buildTopics(topicPool);
  const weeklyDigests = buildWeeklyDigests(stories);
  console.time('[refresh] brief');
  info('pipeline_checkpoint', { phase: 'brief', daily: daily.length, memMB: Math.round(process.memoryUsage().rss / 1e6) });
  const brief = await buildBrief(daily);
  console.timeEnd('[refresh] brief');
  const topicBlocks = buildTopicBlocks(stories);
  const digest = buildWeeklyDigest(stories);

  const topTopics = daily.flatMap((item) => item.topics).slice(0, 3);
  const dailyInsight = selectDailyInsight(topTopics);
  const sourceHealth = buildHealthSummary(healthStore, sources);

  const qualityMetrics = computeQualityMetrics(collectedCount, unique.length, stories, sourceHealth);

  // AI market intelligence
  const marketStories = stories.filter((s) =>
    s.topics?.some((t) => ['economy', 'finance', 'macroeconomics', 'markets'].includes(t))
  ).slice(0, 6);
  const aiMarket = await generateMarketIntelligence(marketStories);
  const marketPulse = aiMarket?.pulse || deriveMarketPulseFallback(stories);

  const nextStore = {
    ...store,
    lastUpdated: new Date().toISOString(),
    runId: stableId([String(Date.now()), String(sorted.length)]),
    daily,
    highImportance,
    weeklyDigests,
    topics,
    stories,
    brief,
    topicBlocks,
    digest,
    articles: recent,
    marketPulse,
    quotes: {
      dailyInsight: dailyInsight.text,
      source: dailyInsight.source
    },
    metrics,
    sourceHealth,
    marketIntelligence: aiMarket || null,
    qualityMetrics,
    refreshOutcome: 'updated',
    refreshAttemptAt: new Date().toISOString(),
    forcedRefresh: force,
    meta: { ...(store.meta || {}), lastRefresh: new Date().toISOString() }
  };

  if (process.env.REFRESH_DRY_RUN === 'true') {
    info('dry_run_complete', { count: sorted.length });
    return nextStore;
  }

  console.time('[refresh] store-write');
  if (!requestedIds.size && requestedTier == null) {
    cache.meta = { ...(cache.meta || {}), sourceCursor: (cursor + maxSources) % Math.max(1, sources.length) };
  }
  await saveJson(STORE_PATH, nextStore);
  await saveJson(CACHE_PATH, cache);
  await saveJson(HEALTH_PATH, healthStore);
  console.timeEnd('[refresh] store-write');
  await writeQualityReport(qualityMetrics, {
    runId: nextStore.runId,
    refreshOutcome: nextStore.refreshOutcome,
    durationMs: metrics.durationMs,
    requests: metrics.requests
  });
  await appendToArchive(stories, DATA_DIR);

  if (digest) {
    const emailHtml = buildDigestEmail(digest);
    await writeFile(`${DATA_DIR}/weekly-email.html`, emailHtml);
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  await writeRobots(baseUrl);
  await writeSitemap(nextStore, baseUrl);
  await writeSiteFeed(nextStore, baseUrl);

  info('refresh_complete', { count: sorted.length, daily: daily.length });
  return nextStore;
}

function withinHours(isoDate, hours) {
  const diff = Date.now() - new Date(isoDate).getTime();
  return diff <= hours * 3600000;
}

function buildTopics(articles) {
  const map = new Map();
  for (const article of articles) {
    for (const topic of article.topics) {
      if (!map.has(topic)) map.set(topic, []);
      map.get(topic).push(article);
    }
  }
  return Array.from(map.entries())
    .map(([topic, items]) => ({
      topic,
      label: toTitle(topic),
      count: items.length,
      range: rangeFor(items),
      items: items
        .slice()
        .sort((a, b) => (b.score || 0) - (a.score || 0) || String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || '')))
        .slice(0, 120)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

function buildTopicPool(currentStories, archiveStore) {
  const byId = new Map();
  for (const story of currentStories) byId.set(story.id, story);
  for (const day of archiveStore.days || []) {
    for (const story of day.stories || []) {
      if (!story?.id || byId.has(story.id)) continue;
      byId.set(story.id, story);
    }
  }
  return Array.from(byId.values());
}

function buildWeeklyDigests(articles) {
  const map = new Map();
  for (const article of articles) {
    const date = new Date(article.publishedAt);
    const year = date.getUTCFullYear();
    const week = weekNumber(date);
    const key = `${year}-W${week}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(article);
  }

  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 6)
    .map(([key, items]) => {
      const sorted = items.sort((a, b) => b.score - a.score);
      const dates = items.map((i) => i.publishedAt).sort();
      return {
        key,
        label: `Week ${key.split('W')[1]}`,
        count: items.length,
        range: { start: dates[0] || null, end: dates[dates.length - 1] || null },
        top: sorted.slice(0, 5)
      };
    });
}

function weekNumber(date) {
  const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
}

function rangeFor(items) {
  const dates = items.map((item) => item.publishedAt).sort();
  if (!dates.length) return null;
  return { start: dates[0], end: dates[dates.length - 1] };
}

function toTitle(value) {
  return value.replace(/(^|\s|_)([a-z])/g, (_, sep, char) => `${sep}${char.toUpperCase()}`).replace(/_/g, ' ').trim();
}

function deriveMarketPulseFallback(stories) {
  const marketStories = stories.filter((story) => story.topics?.includes('economy') || story.topics?.includes('markets'));
  if (!marketStories.length) return 'Stable';
  const avgScore = marketStories.reduce((sum, item) => sum + item.score, 0) / marketStories.length;
  if (avgScore > 0.75) return 'Volatile';
  if (avgScore > 0.6) return 'Active';
  return 'Stable';
}

function selectDailyStories(stories, refreshConfig) {
  const limit = 30;
  const selected = [];
  const state = createDiversityState();

  const domestic = stories.filter((story) => isDomesticPriority(story));
  const strategic = stories.filter((story) => !isDomesticPriority(story) && isStrategicInternational(story, refreshConfig));
  const remainder = stories.filter((story) => !isDomesticPriority(story) && !isStrategicInternational(story, refreshConfig));

  for (const [groupName, group] of [['domestic', domestic], ['strategic', strategic], ['remainder', remainder]]) {
    for (const story of group) {
      if (selected.length >= limit) break;
      if (!allowStoryIntoSelection(story, selected, state, groupName)) continue;
      selected.push(story);
    }
    if (selected.length >= limit) break;
  }

  return selected;
}

function selectHighImportanceStories(stories, refreshConfig) {
  const limit = 12;
  const selected = [];
  const state = createDiversityState();
  const ranked = stories.filter((item) => isHighImportance(item, refreshConfig.importance));

  const legislative = ranked
    .filter((story) => isLegislationPriority(story))
    .sort((a, b) => legislativeScore(b) - legislativeScore(a));
  const domestic = ranked.filter((story) => !isLegislationPriority(story) && isDomesticPriority(story));
  const strategic = ranked.filter((story) => !isLegislationPriority(story) && !isDomesticPriority(story) && isStrategicInternational(story, refreshConfig));
  const remainder = ranked.filter((story) => !isLegislationPriority(story) && !isDomesticPriority(story) && !isStrategicInternational(story, refreshConfig));

  for (const [groupName, group] of [['legislative', legislative], ['domestic', domestic], ['strategic', strategic], ['remainder', remainder]]) {
    for (const story of group) {
      if (selected.length >= limit) break;
      if (!allowStoryIntoSelection(story, selected, state, groupName)) continue;
      selected.push(story);
    }
    if (selected.length >= limit) break;
  }

  return selected;
}

function isDomesticPriority(story) {
  const topics = story.topics || [];
  const countries = (story.entities?.countries || []).map((c) => String(c).toLowerCase());
  const regions = (story.regions || []).map((r) => String(r).toUpperCase());
  const text = `${story.headline || ''} ${story.dek || ''}`.toLowerCase();

  if (topics.some((topic) => ['uspolitics', 'law', 'elections', 'local', 'housing', 'labor', 'education'].includes(topic))) return true;
  if (regions.some((region) => region === 'US' || region.startsWith('US-'))) return true;
  if (countries.some((country) => ['united states', 'us', 'usa', 'america'].includes(country))) return true;

  return /(u\.s\.|united states|american|white house|congress|senate|house republicans|supreme court|federal reserve|treasury|pentagon|state department|homeland security|cdc|fda)/i.test(text);
}

function isStrategicInternational(story, refreshConfig) {
  const topics = story.topics || [];
  const text = `${story.headline || ''} ${story.dek || ''}`.toLowerCase();
  const scoreThreshold = Math.max(0.78, refreshConfig?.importance?.scoreThreshold || 0.72);
  const criticalTopic = topics.some((topic) => ['defense', 'geopolitics', 'global_trade', 'international', 'economy', 'finance', 'macroeconomics', 'tech', 'ai'].includes(topic));
  const directUsImpact = /(u\.s\.|united states|american|washington|pentagon|white house|state department|treasury|federal reserve|congress|tariff|treaty|sanction|trade deal|ceasefire|attack|missile|chip|semiconductor|shipping|oil|nato|china|russia|iran|taiwan)/i.test(text);
  const foreignLocal = /(street|local council|district|mayor|provincial|municipal|school|housing project|families of soldiers|local residents)/i.test(text);

  return criticalTopic && directUsImpact && !foreignLocal && story.score >= scoreThreshold;
}

function createDiversityState() {
  return {
    ids: new Set(),
    sourceCounts: new Map(),
    regionCounts: new Map(),
    familyCounts: new Map()
  };
}

function allowStoryIntoSelection(story, selected, state, groupName) {
  if (!story?.id || state.ids.has(story.id)) return false;

  const source = story.sources?.[0]?.name || story.source || '';
  const region = storyRegionKey(story);
  const family = storyFamilyKey(story);
  const sourceLimit = groupName === 'domestic' ? 3 : groupName === 'legislative' ? 2 : 1;
  const familyLimit = groupName === 'domestic' ? 2 : 1;
  const regionLimit = groupName === 'domestic' || region === 'US' ? 99 : groupName === 'strategic' ? 1 : 1;

  if (source && (state.sourceCounts.get(source) || 0) >= sourceLimit) return false;
  if (family && (state.familyCounts.get(family) || 0) >= familyLimit) return false;
  if (region && (state.regionCounts.get(region) || 0) >= regionLimit) return false;
  if (selected.some((item) => isTooSimilar(item, story, groupName))) return false;

  state.ids.add(story.id);
  if (source) state.sourceCounts.set(source, (state.sourceCounts.get(source) || 0) + 1);
  if (family) state.familyCounts.set(family, (state.familyCounts.get(family) || 0) + 1);
  if (region) state.regionCounts.set(region, (state.regionCounts.get(region) || 0) + 1);
  return true;
}

function storyRegionKey(story) {
  const regions = (story.regions || []).map((region) => String(region).toUpperCase());
  if (regions.some((region) => region === 'US' || region.startsWith('US-'))) return 'US';
  return regions[0] || '';
}

function storyFamilyKey(story) {
  const primaryTopic = story.topics?.[0] || 'general';
  const text = `${story.headline || ''} ${story.dek || ''}`.toLowerCase();
  if (/(north korea|n\.k\.|kim jong|south korea|s\. korean)/i.test(text)) return `${primaryTopic}:korea`;
  if (/\biran\b/i.test(text)) return `${primaryTopic}:iran`;
  if (/\bchina\b/i.test(text)) return `${primaryTopic}:china`;
  if (/\brussia\b|\bukraine\b/i.test(text)) return `${primaryTopic}:russia-ukraine`;
  if (/\bcongress\b|\bsenate\b|\bhouse\b|\bwhite house\b/i.test(text)) return `${primaryTopic}:us-federal`;
  const region = storyRegionKey(story) || 'global';
  return `${primaryTopic}:${region}`;
}

function isTooSimilar(left, right, groupName) {
  const leftTitle = normalizeTitle(left.headline || left.title || '');
  const rightTitle = normalizeTitle(right.headline || right.title || '');
  const similarity = jaccardSimilarity(leftTitle, rightTitle);
  if (similarity >= 0.62) return true;
  if (groupName !== 'domestic' && storyFamilyKey(left) === storyFamilyKey(right)) return true;
  return false;
}

function isLegislationPriority(story) {
  const topics = story.topics || [];
  const text = `${story.headline || ''} ${story.dek || ''}`.toLowerCase();
  const docs = story.primaryDocs || [];
  return topics.some((topic) => ['law', 'uspolitics'].includes(topic))
    && (docs.some((doc) => /congress\.gov|govinfo\.gov|federalregister\.gov|\.gov(\/|$)/i.test(doc.url || ''))
      || /\b(h\.r\.|s\.|h\.j\.res\.|s\.j\.res\.|bill|appropriation|resolution|act)\b/i.test(text));
}

function legislativeScore(story) {
  const docs = story.primaryDocs || [];
  const officialBoost = docs.some((doc) => /congress\.gov|govinfo\.gov|federalregister\.gov|\.gov(\/|$)/i.test(doc.url || '')) ? 0.35 : 0;
  const primaryAgencyBoost = docs.some((doc) => /whitehouse\.gov|supremecourt\.gov|federalregister\.gov|govinfo\.gov|congress\.gov|fema\.gov/i.test(doc.url || '')) ? 0.25 : 0;
  const recency = new Date(story.updatedAt || story.publishedAt || 0).getTime() / 1e13;
  return (story.score || 0) + officialBoost + primaryAgencyBoost + recency;
}

function linkRelatedStories(stories) {
  const byTopic = new Map();
  stories.forEach((story) => {
    story.topics.forEach((topic) => {
      if (!byTopic.has(topic)) byTopic.set(topic, []);
      byTopic.get(topic).push(story);
    });
  });
  stories.forEach((story) => {
    const related = new Map();
    story.topics.forEach((topic) => {
      (byTopic.get(topic) || []).forEach((candidate) => {
        if (candidate.id !== story.id) related.set(candidate.id, candidate);
      });
    });
    story.related = Array.from(related.values()).slice(0, 4).map((item) => ({
      id: item.id,
      slug: item.slug,
      headline: item.headline
    }));
  });
}

if (process.argv[1]?.includes('refresh.js')) {
  refreshOnce().catch((err) => {
    error('refresh_failed', { message: err.message });
    process.exit(1);
  });
}
