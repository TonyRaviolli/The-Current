export function scoreArticle(article, config, localRegion) {
  const now = Date.now();
  const published = article.publishedAt ? new Date(article.publishedAt).getTime() : now;
  const ageHours = Math.max(0, (now - published) / 3600000);
  const halfLife = config.recencyHalfLifeHours || 12;
  const recency = Math.pow(0.5, ageHours / halfLife);

  const tierWeight = config.tierWeights[String(article.tier)] || 0.6;
  const topicBoosts = article.topics.reduce((sum, topic) => sum + (config.topicBoosts[topic] || 0), 0);
  const cappedTopicBoosts = Math.min(topicBoosts, config.maxTopicBoost || 0.18);
  const localBoost = article.region && article.region === localRegion ? config.localRegionBoost : 0;
  const duplicatePenalty = article.duplicate ? config.duplicatePenalty : 0;
  const usPriorityBoost = isUsPriority(article, localRegion) ? (config.usPriorityBoost || 0.12) : 0;
  const strategicIntlBoost = isStrategicInternational(article) ? (config.strategicIntlBoost || 0.04) : 0;
  const foreignLocalPenalty = isForeignLocal(article, localRegion) ? (config.foreignLocalPenalty || 0.12) : 0;
  const baselinePenalty = config.baselinePenalty || 0.18;

  const raw = tierWeight * 0.42 + recency * 0.24 + cappedTopicBoosts + localBoost + usPriorityBoost + strategicIntlBoost - duplicatePenalty - foreignLocalPenalty - baselinePenalty;
  const bounded = Math.max(0, Math.min(1, raw));
  const score = Math.pow(bounded, config.scoreExponent || 1.18);

  return {
    score,
    breakdown: {
      tierWeight,
      recency,
      topicBoosts,
      cappedTopicBoosts,
      localBoost,
      duplicatePenalty,
      usPriorityBoost,
      strategicIntlBoost,
      foreignLocalPenalty,
      baselinePenalty
    }
  };
}

export function isHighImportance(article, importanceConfig) {
  if (article.score >= importanceConfig.scoreThreshold) return true;
  return article.topics.some((topic) => importanceConfig.topicTriggers.includes(topic));
}

function isUsPriority(article, localRegion) {
  const topics = article.topics || [];
  const text = `${article.title || ''} ${article.summary || ''}`.toLowerCase();
  const articleCountry = regionCountry(article.region);
  const localCountry = regionCountry(localRegion);

  if (topics.some((topic) => ['uspolitics', 'law', 'elections', 'local', 'housing', 'labor', 'education'].includes(topic))) return true;
  if (articleCountry && localCountry && articleCountry === localCountry) return true;

  return /(u\.s\.|united states|american|white house|congress|senate|house|supreme court|treasury|federal reserve|pentagon|cia|fbi|dhs|hhs|cdc|fda|state department|homeland security)/i.test(text);
}

function isStrategicInternational(article) {
  const topics = article.topics || [];
  const text = `${article.title || ''} ${article.summary || ''}`.toLowerCase();
  const strategicTopic = topics.some((topic) => ['defense', 'geopolitics', 'global_trade', 'economy', 'finance', 'macroeconomics', 'tech', 'ai', 'cyber'].includes(topic));
  const majorSignal = /(attack|warning|alert|treaty|sanction|tariff|ceasefire|missile|military|navy|nato|china|russia|iran|taiwan|shipping|oil|semiconductor|trade)/i.test(text);
  return strategicTopic && majorSignal;
}

function isForeignLocal(article, localRegion) {
  const topics = article.topics || [];
  const text = `${article.title || ''} ${article.summary || ''}`.toLowerCase();
  const articleCountry = regionCountry(article.region);
  const localCountry = regionCountry(localRegion);
  if (!articleCountry || !localCountry || articleCountry === localCountry) return false;
  if (isUsPriority(article, localRegion) || isStrategicInternational(article)) return false;
  if (/(u\.s\.|united states|american)/i.test(text)) return false;

  return topics.some((topic) => ['international', 'local', 'housing', 'labor', 'education', 'elections'].includes(topic));
}

function regionCountry(region) {
  if (!region) return '';
  return String(region).split('-')[0].toUpperCase();
}
