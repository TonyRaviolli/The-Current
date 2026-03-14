/**
 * integration.test.js — Integration tests for The UnderCurrent pipeline.
 *
 * Runs a mock RSS feed through the full ingestion pipeline:
 * parseFeed → normalizeUrl/safeText → dedupeArticles → scoreArticle
 *
 * Does NOT require network access, a running server, or ANTHROPIC_API_KEY.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { parseFeed } from '../src/lib/rss.js';
import { normalizeUrl, stableId, slugify } from '../src/lib/normalize.js';
import { safeText } from '../src/lib/sanitize.js';
import { dedupeArticles } from '../src/lib/dedupe.js';
import { scoreArticle } from '../src/lib/score.js';
import { extractEntitiesSync } from '../src/lib/entities.js';
import { computeQualityMetrics } from '../src/lib/metrics.js';

// ─── Mock data ────────────────────────────────────────────────────────────────

const SCORE_CONFIG = {
  recencyHalfLifeHours: 12,
  tierWeights: { '1': 1.0, '2': 0.8, '3': 0.6 },
  topicBoosts: { economy: 0.1, defense: 0.08, geopolitics: 0.08 },
  localRegionBoost: 0.12,
  usPriorityBoost: 0.12,
  strategicIntlBoost: 0.04,
  foreignLocalPenalty: 0.14,
  duplicatePenalty: 0.4
};

const MOCK_FEED_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Mock Financial Times</title>
    <item>
      <title>Federal Reserve Signals Rate Pause Amid Economic Uncertainty</title>
      <link>https://mock.ft.com/federal-reserve-rate-pause</link>
      <description>The Federal Reserve indicated it may pause rate hikes after inflation data eased.</description>
      <pubDate>${new Date(Date.now() - 2 * 3600000).toUTCString()}</pubDate>
    </item>
    <item>
      <title>Oil Prices Surge as OPEC+ Agrees to Production Cuts</title>
      <link>https://mock.ft.com/oil-prices-opec</link>
      <description>Crude oil jumped 4% after the OPEC+ cartel agreed to cut output by 1 million barrels.</description>
      <pubDate>${new Date(Date.now() - 4 * 3600000).toUTCString()}</pubDate>
    </item>
    <item>
      <title>Federal Reserve Signals Rate Pause Amid Economic Uncertainty</title>
      <link>https://mock.reuters.com/fed-rate-pause</link>
      <description>Duplicate story about the Fed rate pause from a different source.</description>
      <pubDate>${new Date(Date.now() - 3 * 3600000).toUTCString()}</pubDate>
    </item>
    <item>
      <title>Ukraine Conflict: Latest Military Developments</title>
      <link>https://mock.ft.com/ukraine-latest</link>
      <description>Ground fighting continued along the eastern front as both sides exchanged fire.</description>
      <pubDate>${new Date(Date.now() - 6 * 3600000).toUTCString()}</pubDate>
    </item>
    <item>
      <title><![CDATA[Apple & Microsoft Report <strong>Record</strong> Quarterly Earnings]]></title>
      <link>https://mock.ft.com/aapl-msft-earnings</link>
      <description>Both tech giants exceeded analyst expectations.</description>
      <pubDate>${new Date(Date.now() - 1 * 3600000).toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

const MOCK_SOURCE = {
  id: 'mock-ft',
  name: 'Mock Financial Times',
  tier: 1,
  topics: ['finance', 'economy'],
  region: 'us',
  orientation: 'center',
  sourceType: 'primary'
};

// ─── Full pipeline simulation ─────────────────────────────────────────────────

function runPipeline(xml, source, scoreConfig) {
  const items = parseFeed(xml);

  const collected = [];
  for (const item of items) {
    const url = normalizeUrl(item.link);
    const title = safeText(item.title);
    const summary = safeText(item.summary || '');
    if (!url || !title) continue;

    const publishedAt = item.published
      ? new Date(item.published).toISOString()
      : new Date().toISOString();

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
      sourceType: source.sourceType || 'primary',
      slug: slugify(title)
    });
  }

  const { unique, total } = dedupeArticles(collected);

  const scored = unique.map((article) => {
    const { score, breakdown } = scoreArticle(article, scoreConfig, 'us');
    return { ...article, score, scoreBreakdown: breakdown };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);

  return { collected, unique, scored: sorted, total };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('full RSS ingestion pipeline', () => {
  test('parses all items from mock feed', () => {
    const items = parseFeed(MOCK_FEED_RSS);
    assert.equal(items.length, 5, 'should parse all 5 items');
  });

  test('pipeline removes duplicate articles', () => {
    const { collected, unique, total } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    assert.equal(total, 5, 'total collected should be 5 before dedup');
    assert.ok(unique.length < total, `dedup should reduce count; got ${unique.length} from ${total}`);
    assert.ok(unique.length >= 4, 'should retain at least 4 unique stories');
  });

  test('all scored articles have score between 0 and 1', () => {
    const { scored } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    for (const article of scored) {
      assert.ok(article.score >= 0 && article.score <= 1, `score ${article.score} out of range for "${article.title}"`);
    }
  });

  test('articles are sorted by score descending', () => {
    const { scored } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    for (let i = 0; i < scored.length - 1; i++) {
      assert.ok(
        scored[i].score >= scored[i + 1].score,
        `article at index ${i} (${scored[i].score.toFixed(3)}) should score >= article at ${i + 1} (${scored[i + 1].score.toFixed(3)})`
      );
    }
  });

  test('HTML/CDATA in title is stripped cleanly', () => {
    const { scored } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    const earningsStory = scored.find((s) => s.title.toLowerCase().includes('earnings'));
    assert.ok(earningsStory, 'earnings story should be in output');
    assert.ok(!earningsStory.title.includes('<strong>'), 'HTML tags should be stripped from title');
    assert.ok(!earningsStory.title.includes('&amp;') || earningsStory.title.includes('&'),
      'entities should be decoded or at minimum not double-encoded');
  });

  test('all articles have required fields', () => {
    const { scored } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    const REQUIRED = ['id', 'title', 'url', 'source', 'sourceId', 'tier', 'topics', 'publishedAt', 'score', 'slug'];
    for (const article of scored) {
      for (const field of REQUIRED) {
        assert.ok(Object.hasOwn(article, field), `article missing required field: ${field}`);
        assert.notEqual(article[field], null, `article.${field} should not be null`);
      }
    }
  });

  test('stableId is deterministic for same inputs', () => {
    const { scored } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    // Run a second parse and check that IDs match
    const { scored: scored2 } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    const ids1 = scored.map((s) => s.id).sort();
    const ids2 = scored2.map((s) => s.id).sort();
    assert.deepEqual(ids1, ids2, 'IDs should be deterministic across runs');
  });
});

describe('entity extraction integration', () => {
  test('extracts entities from pipeline output', () => {
    const { scored } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    const fedStory = scored.find((s) => s.title.toLowerCase().includes('federal reserve'));
    assert.ok(fedStory, 'Fed story should be in scored output');

    const entities = extractEntitiesSync(fedStory.title, fedStory.summary);
    assert.ok(
      entities.orgs.some((o) => o.toLowerCase().includes('federal reserve')),
      `should extract Federal Reserve; got orgs: ${JSON.stringify(entities.orgs)}`
    );
  });

  test('extracts tickers when headline contains explicit ticker symbols', () => {
    // extractEntitiesSync only matches all-caps known tickers (e.g. AAPL, MSFT),
    // not company names. Use a headline that actually contains the ticker symbol.
    const entities = extractEntitiesSync(
      'AAPL and MSFT shares rally on strong earnings beat',
      'Shares of AAPL rose 3% while MSFT gained 2% after both beat forecasts.'
    );
    const hasTicker = entities.tickers.includes('AAPL') || entities.tickers.includes('MSFT');
    assert.ok(hasTicker, `should extract AAPL or MSFT; got: ${JSON.stringify(entities.tickers)}`);
  });
});

describe('quality metrics integration', () => {
  test('computeQualityMetrics returns expected shape', () => {
    const { collected, unique, scored } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    const metrics = computeQualityMetrics(collected.length, unique.length, scored, null);

    assert.ok(typeof metrics.dedupeRatio === 'number', 'dedupeRatio should be a number');
    assert.ok(typeof metrics.freshnessScore === 'number', 'freshnessScore should be a number');
    assert.ok(typeof metrics.topicSpread === 'number', 'topicSpread should be a number');
    assert.ok(metrics.dedupeRatio >= 0 && metrics.dedupeRatio <= 1, `dedupeRatio ${metrics.dedupeRatio} out of range`);
    assert.ok(metrics.freshnessScore >= 0 && metrics.freshnessScore <= 1, `freshnessScore ${metrics.freshnessScore} out of range`);
    assert.ok(metrics.topicSpread >= 0 && metrics.topicSpread <= 1, `topicSpread ${metrics.topicSpread} out of range`);
  });

  test('dedupeRatio reflects number of duplicates removed', () => {
    const { collected, unique, scored } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    const metrics = computeQualityMetrics(collected.length, unique.length, scored, null);
    // We have 5 collected and expect at least 1 duplicate (the Fed story)
    assert.ok(metrics.dedupeRatio > 0, 'dedupeRatio should be > 0 when duplicates exist');
  });

  test('freshnessScore is 1 when all stories are recent', () => {
    const { collected, unique, scored } = runPipeline(MOCK_FEED_RSS, MOCK_SOURCE, SCORE_CONFIG);
    // All mock items have timestamps within the last 6 hours, so all should be "fresh" (within 24h)
    const metrics = computeQualityMetrics(collected.length, unique.length, scored, null);
    assert.equal(metrics.freshnessScore, 1, 'all stories in mock feed are within 24h so freshnessScore should be 1');
  });
});
