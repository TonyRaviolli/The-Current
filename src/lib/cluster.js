import { jaccardSimilarity, normalizeTitle, stableId } from './normalize.js';
import { extractEntitiesSync, entityOverlapScore } from './entities.js';

export function clusterArticles(articles = [], options = {}) {
  const similarityThreshold = options.similarityThreshold ?? 0.68;
  const maxHours = options.maxHours ?? 72;
  const clusters = [];

  for (const article of articles) {
    const articleTime = new Date(article.publishedAt).getTime();
    const normalizedTitle = normalizeTitle(article.title);
    const articleEntities = extractEntitiesSync(article.title, article.summary || '', article.topics || []);
    let matched = null;

    for (const cluster of clusters) {
      const leadTitle = cluster.lead.title;
      const timeDiffHours = Math.abs(articleTime - cluster.updatedAt) / 3600000;
      if (timeDiffHours > maxHours) continue;

      const similarity = jaccardSimilarity(leadTitle, article.title);
      const topicOverlap = (article.topics || []).some((topic) => cluster.topics.has(topic));
      const entityOverlap = entityOverlapScore(articleEntities, cluster.leadEntities);

      // Match if: high text similarity, OR topic+text similarity, OR significant entity overlap
      const textMatch = similarity >= similarityThreshold;
      const topicTextMatch = topicOverlap && similarity >= similarityThreshold - 0.08;
      const entityMatch = entityOverlap >= 0.3 && similarity >= 0.3 && topicOverlap;

      if (textMatch || topicTextMatch || entityMatch) {
        matched = cluster;
        break;
      }
      if (normalizedTitle && cluster.signatures.has(normalizedTitle)) {
        matched = cluster;
        break;
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
        leadEntities: articleEntities
      };
      clusters.push(matched);
    }

    matched.items.push(article);
    matched.updatedAt = Math.max(matched.updatedAt, articleTime);
    (article.topics || []).forEach((topic) => matched.topics.add(topic));
    if (normalizedTitle) matched.signatures.add(normalizedTitle);

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
