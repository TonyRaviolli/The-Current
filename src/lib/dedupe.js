import { jaccardSimilarity, normalizeTitle } from './normalize.js';

// Breaking-news prefixes that vary across sources but mean the same story
const PREFIX_RE = /^(breaking\s*:?\s*|update\s*:?\s*|exclusive\s*:?\s*|developing\s*:?\s*|alert\s*:?\s*)+/i;

/**
 * Strip editorial prefixes that cause false-negative matches.
 * "BREAKING: Fed Raises Rates" and "Fed Raises Rates" are the same story.
 */
function stripPrefixes(title = '') {
  return title.replace(PREFIX_RE, '').trim();
}

/**
 * Deduplicate articles using:
 *  1. Exact URL match (fastest — same article reposted verbatim)
 *  2. Normalized title exact match
 *  3. Jaccard similarity on prefix-stripped titles (catches near-duplicates)
 *
 * @param {Array}  articles  - Raw collected articles
 * @param {number} threshold - Jaccard similarity threshold (0–1); default 0.72
 * @returns {{ unique: Array, total: number }}
 */
export function dedupeArticles(articles, threshold = 0.72) {
  const result = [];
  const seenUrls = new Set();
  const seenTitles = new Set();

  for (const article of articles) {
    // 1. Exact URL dedup
    if (article.url && seenUrls.has(article.url)) {
      article.duplicate = true;
      continue;
    }

    // 2. Exact normalized title dedup
    const normalized = normalizeTitle(stripPrefixes(article.title));
    if (seenTitles.has(normalized)) {
      article.duplicate = true;
      continue;
    }

    // 3. Jaccard near-duplicate check against already-accepted articles
    const stripped = stripPrefixes(article.title);
    let isDuplicate = false;
    for (const existing of result) {
      const similarity = jaccardSimilarity(stripPrefixes(existing.title), stripped);
      if (similarity >= threshold) {
        isDuplicate = true;
        article.duplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      if (article.url) seenUrls.add(article.url);
      seenTitles.add(normalized);
      result.push(article);
    }
  }

  return { unique: result, total: articles.length };
}
