import { jaccardSimilarity, normalizeTitle, stableId } from './normalize.js';
import { extractEntitiesSync, entityOverlapScore } from './entities.js';

const ENTITY_KEYS = ['people', 'orgs', 'countries', 'tickers'];

/** Ensure every article.entities has all 4 required array fields (Issue 4). */
function normalizeEntities(e) {
  if (!e || typeof e !== 'object') return { people: [], orgs: [], countries: [], tickers: [] };
  const out = {};
  for (const key of ENTITY_KEYS) out[key] = Array.isArray(e[key]) ? e[key] : [];
  return out;
}

export function clusterArticles(articles = [], options = {}) {
  const similarityThreshold = options.similarityThreshold ?? 0.68;
  const maxHours = options.maxHours ?? 72;
  const clusters = [];

  // Issue 8: O(1) pre-check map — normalizedTitle → clusterId
  const signatureIndex = new Map(); // normalizedTitle → cluster reference

  for (const article of articles) {
    const articleTime = new Date(article.publishedAt).getTime();
    const normalizedTitle = normalizeTitle(article.title);
    const articleEntities = normalizeEntities(extractEntitiesSync(article.title, article.summary || '', article.topics || []));
    let matched = null;

    // Fast O(1) signature check before iterating all clusters
    if (normalizedTitle && signatureIndex.has(normalizedTitle)) {
      matched = signatureIndex.get(normalizedTitle);
    }

    if (!matched) {
      for (const cluster of clusters) {
        const timeDiffHours = Math.abs(articleTime - cluster.updatedAt) / 3600000;
        if (timeDiffHours > maxHours) continue;

        const similarity = jaccardSimilarity(cluster.lead.title, article.title);
        const topicOverlap = (article.topics || []).some((topic) => cluster.topics.has(topic));

        // Issue 8: early-exit once textMatch is satisfied — skip entity check
        const textMatch = similarity >= similarityThreshold;
        if (textMatch) { matched = cluster; break; }

        const topicTextMatch = topicOverlap && similarity >= similarityThreshold - 0.08;
        if (topicTextMatch) { matched = cluster; break; }

        const entityOverlap = entityOverlapScore(articleEntities, cluster.leadEntities);
        const entityMatch = entityOverlap >= 0.3 && similarity >= 0.3 && topicOverlap;
        if (entityMatch) { matched = cluster; break; }

        if (normalizedTitle && cluster.signatures.has(normalizedTitle)) { matched = cluster; break; }
      }
    }

    if (!matched) {
      const id = stableId([normalizeTitle(article.title), article.publishedAt]);
      matched = {
        id,
        lead: article,
        items: [],
        topics: new Set(article.topics || []),
        updatedAt: articleTime,
        signatures: new Set(normalizedTitle ? [normalizedTitle] : []),
        leadEntities: normalizeEntities(articleEntities)
      };
      clusters.push(matched);
    }

    matched.items.push(article);
    matched.updatedAt = Math.max(matched.updatedAt, articleTime);
    (article.topics || []).forEach((topic) => matched.topics.add(topic));
    if (normalizedTitle) {
      matched.signatures.add(normalizedTitle);
      // Keep signatureIndex up-to-date for O(1) future lookups
      if (!signatureIndex.has(normalizedTitle)) signatureIndex.set(normalizedTitle, matched);
    }

    if (article.score > matched.lead.score) {
      matched.lead = article;
    }
  }

  return clusters.map(({ leadEntities: _le, ...cluster }) => ({
    ...cluster,
    topics: Array.from(cluster.topics),
    updatedAt: new Date(cluster.updatedAt).toISOString()
  }));
}
