/**
 * SCORE_DEFAULTS — fallback constants used when config/refresh.json values
 * are absent. Mirrors the defaults in config/refresh.json so behaviour is
 * consistent whether the server config file is read or not. (Issue 11)
 */
const SCORE_DEFAULTS = {
  recencyHalfLifeHours: 10,      // hours at which recency decays to 0.5
  tierWeights: { '1': 1, '2': 0.78, '3': 0.58 },
  maxTopicBoost: 0.18,           // cap on cumulative topic boosts
  localRegionBoost: 0.08,        // boost for matching local region
  duplicatePenalty: 0.15,        // penalty for duplicate articles
  usPriorityBoost: 0.12,         // boost for US-priority stories
  strategicIntlBoost: 0.04,      // boost for strategic international stories
  foreignLocalPenalty: 0.12,     // penalty for foreign local stories
  baselinePenalty: 0.18,         // flat penalty applied to all articles
  scoreExponent: 1.18            // power to raise the bounded raw score
};

export function scoreArticle(article, config, localRegion) {
  const now = Date.now();
  const published = article.publishedAt ? new Date(article.publishedAt).getTime() : now;
  const ageHours = Math.max(0, (now - published) / 3600000);
  const halfLife = config.recencyHalfLifeHours ?? SCORE_DEFAULTS.recencyHalfLifeHours;
  const recency = Math.pow(0.5, ageHours / halfLife);

  const tw = config.tierWeights || SCORE_DEFAULTS.tierWeights;
  const tierWeight = tw[String(article.tier)] ?? 0.6;
  const topicBoosts = (article.topics || []).reduce((sum, topic) => sum + (config.topicBoosts?.[topic] || 0), 0);
  const cappedTopicBoosts = Math.min(topicBoosts, config.maxTopicBoost ?? SCORE_DEFAULTS.maxTopicBoost);
  const localBoost = article.region && article.region === localRegion ? (config.localRegionBoost ?? SCORE_DEFAULTS.localRegionBoost) : 0;
  const duplicatePenalty = article.duplicate ? (config.duplicatePenalty ?? SCORE_DEFAULTS.duplicatePenalty) : 0;
  const usPriorityBoost = isUsPriority(article, localRegion) ? (config.usPriorityBoost ?? SCORE_DEFAULTS.usPriorityBoost) : 0;
  const strategicIntlBoost = isStrategicInternational(article) ? (config.strategicIntlBoost ?? SCORE_DEFAULTS.strategicIntlBoost) : 0;
  const foreignLocalPenalty = isForeignLocal(article, localRegion) ? (config.foreignLocalPenalty ?? SCORE_DEFAULTS.foreignLocalPenalty) : 0;
  const baselinePenalty = config.baselinePenalty ?? SCORE_DEFAULTS.baselinePenalty;

  const raw = tierWeight * 0.42 + recency * 0.24 + cappedTopicBoosts + localBoost + usPriorityBoost + strategicIntlBoost - duplicatePenalty - foreignLocalPenalty - baselinePenalty;
  const bounded = Math.max(0, Math.min(1, raw));
  const score = Math.pow(bounded, config.scoreExponent ?? SCORE_DEFAULTS.scoreExponent);

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
  return (article.topics || []).some((topic) => importanceConfig.topicTriggers.includes(topic));
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
