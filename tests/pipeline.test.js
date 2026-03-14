/**
 * pipeline.test.js — Unit tests for The UnderCurrent pipeline modules.
 * Uses Node.js built-in test runner (node:test). Run with: node --test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { slugify, normalizeUrl, normalizeTitle, jaccardSimilarity, stableId } from '../src/lib/normalize.js';
import { scoreArticle, isHighImportance } from '../src/lib/score.js';
import { dedupeArticles } from '../src/lib/dedupe.js';
import { extractEntitiesSync, entityOverlapScore, mergeEntities } from '../src/lib/entities.js';
import { parseFeed } from '../src/lib/rss.js';
import { stripHtml, safeText } from '../src/lib/sanitize.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

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

const IMPORTANCE_CONFIG = {
  scoreThreshold: 0.75,
  topicTriggers: ['defense', 'elections']
};

function makeArticle(overrides = {}) {
  return {
    id: 'test-id',
    title: 'Test Article About Markets',
    summary: 'A summary.',
    url: 'https://example.com/article',
    source: 'Test Source',
    sourceId: 'test-source',
    tier: 2,
    topics: [],
    region: null,
    publishedAt: new Date().toISOString(),
    orientation: 'center',
    sourceType: 'secondary',
    ...overrides
  };
}

// ─── normalize.js ─────────────────────────────────────────────────────────────

describe('slugify', () => {
  test('converts spaces to hyphens', () => {
    assert.equal(slugify('Hello World'), 'hello-world');
  });

  test('strips special characters', () => {
    assert.equal(slugify('Fed Raises Rates 0.25%!'), 'fed-raises-rates-025');
  });

  test('collapses multiple hyphens', () => {
    assert.equal(slugify('U.S.--Economy'), 'us--economy'.replace(/--+/g, '-'));
  });

  test('handles empty string', () => {
    assert.equal(slugify(''), '');
  });

  test('lowercases the output', () => {
    assert.equal(slugify('NVIDIA Earnings Beat'), 'nvidia-earnings-beat');
  });
});

describe('normalizeUrl', () => {
  test('strips trailing slash', () => {
    assert.equal(normalizeUrl('https://example.com/'), 'https://example.com');
  });

  test('strips hash fragment', () => {
    assert.equal(normalizeUrl('https://example.com/article#section'), 'https://example.com/article');
  });

  test('sorts query params for stability', () => {
    const a = normalizeUrl('https://example.com/?z=1&a=2');
    const b = normalizeUrl('https://example.com/?a=2&z=1');
    assert.equal(a, b);
  });

  test('handles invalid URL gracefully', () => {
    const result = normalizeUrl('not-a-url');
    assert.equal(typeof result, 'string');
  });
});

describe('normalizeTitle', () => {
  test('lowercases and strips punctuation', () => {
    assert.equal(normalizeTitle('Fed Raises Rates!'), 'fed raises rates');
  });

  test('collapses whitespace', () => {
    assert.equal(normalizeTitle('  too   many   spaces  '), 'too many spaces');
  });
});

describe('jaccardSimilarity', () => {
  test('identical titles return 1', () => {
    const sim = jaccardSimilarity('Fed raises rates', 'Fed raises rates');
    assert.equal(sim, 1);
  });

  test('completely different titles return 0', () => {
    const sim = jaccardSimilarity('apple earnings beat', 'ukraine war update');
    assert.equal(sim, 0);
  });

  test('partial overlap returns value between 0 and 1', () => {
    const sim = jaccardSimilarity('Fed raises interest rates sharply', 'Fed keeps interest rates unchanged');
    assert.ok(sim > 0 && sim < 1, `expected 0 < sim < 1, got ${sim}`);
  });

  test('returns 0 for empty strings', () => {
    assert.equal(jaccardSimilarity('', ''), 0);
    assert.equal(jaccardSimilarity('hello', ''), 0);
  });
});

describe('stableId', () => {
  test('same inputs produce same id', () => {
    const a = stableId(['source', 'https://example.com', 'Title', '2024-01-01']);
    const b = stableId(['source', 'https://example.com', 'Title', '2024-01-01']);
    assert.equal(a, b);
  });

  test('different inputs produce different ids', () => {
    const a = stableId(['source', 'https://example.com/a']);
    const b = stableId(['source', 'https://example.com/b']);
    assert.notEqual(a, b);
  });

  test('returns 16-character hex string', () => {
    const id = stableId(['test']);
    assert.match(id, /^[0-9a-f]{16}$/);
  });
});

// ─── score.js ─────────────────────────────────────────────────────────────────

describe('scoreArticle', () => {
  test('score is between 0 and 1', () => {
    const article = makeArticle({ tier: 1, topics: [] });
    const { score } = scoreArticle(article, SCORE_CONFIG, null);
    assert.ok(score >= 0 && score <= 1, `score ${score} out of range`);
  });

  test('tier 1 scores higher than tier 3 (all else equal)', () => {
    const fresh = new Date().toISOString();
    const t1 = scoreArticle(makeArticle({ tier: 1, topics: [], publishedAt: fresh }), SCORE_CONFIG, null);
    const t3 = scoreArticle(makeArticle({ tier: 3, topics: [], publishedAt: fresh }), SCORE_CONFIG, null);
    assert.ok(t1.score > t3.score, `tier 1 (${t1.score}) should beat tier 3 (${t3.score})`);
  });

  test('topic boost increases score', () => {
    const fresh = new Date().toISOString();
    const base = scoreArticle(makeArticle({ tier: 2, topics: [], publishedAt: fresh }), SCORE_CONFIG, null);
    const boosted = scoreArticle(makeArticle({ tier: 2, topics: ['economy'], publishedAt: fresh }), SCORE_CONFIG, null);
    assert.ok(boosted.score > base.score, 'topic boost should increase score');
  });

  test('duplicate penalty decreases score', () => {
    const fresh = new Date().toISOString();
    const clean = scoreArticle(makeArticle({ tier: 2, publishedAt: fresh }), SCORE_CONFIG, null);
    const dup = scoreArticle(makeArticle({ tier: 2, publishedAt: fresh, duplicate: true }), SCORE_CONFIG, null);
    assert.ok(dup.score < clean.score, 'duplicate should score lower');
  });

  test('older articles score lower than fresh ones', () => {
    const now = Date.now();
    const fresh = new Date(now).toISOString();
    const old = new Date(now - 48 * 3600000).toISOString();
    const freshScore = scoreArticle(makeArticle({ tier: 2, topics: [], publishedAt: fresh }), SCORE_CONFIG, null);
    const oldScore = scoreArticle(makeArticle({ tier: 2, topics: [], publishedAt: old }), SCORE_CONFIG, null);
    assert.ok(freshScore.score > oldScore.score, 'fresh should score higher than old');
  });

  test('local region boost is applied when region matches', () => {
    const fresh = new Date().toISOString();
    const withBoost = scoreArticle(makeArticle({ tier: 2, topics: [], region: 'us', publishedAt: fresh }), SCORE_CONFIG, 'us');
    const noBoost = scoreArticle(makeArticle({ tier: 2, topics: [], region: null, publishedAt: fresh }), SCORE_CONFIG, 'us');
    assert.ok(withBoost.score > noBoost.score, 'local region boost should apply');
  });

  test('returns breakdown object with expected fields', () => {
    const { breakdown } = scoreArticle(makeArticle(), SCORE_CONFIG, null);
    for (const key of ['tierWeight', 'recency', 'topicBoosts', 'localBoost', 'duplicatePenalty', 'usPriorityBoost', 'strategicIntlBoost', 'foreignLocalPenalty']) {
      assert.ok(Object.hasOwn(breakdown, key), `missing breakdown.${key}`);
    }
  });

  test('foreign local stories are penalized relative to U.S.-priority stories', () => {
    const fresh = new Date().toISOString();
    const usStory = scoreArticle(makeArticle({
      title: 'White House and Congress weigh defense response',
      summary: 'American officials assess federal options.',
      topics: ['uspolitics', 'defense'],
      region: 'US',
      publishedAt: fresh
    }), SCORE_CONFIG, 'US');
    const foreignLocal = scoreArticle(makeArticle({
      title: 'Regional labor strike expands in Lagos',
      summary: 'Local transport unions plan another stoppage.',
      topics: ['international', 'labor'],
      region: 'NG',
      publishedAt: fresh
    }), SCORE_CONFIG, 'US');
    assert.ok(usStory.score > foreignLocal.score, `expected U.S. priority score > foreign local score; got ${usStory.score} vs ${foreignLocal.score}`);
  });
});

describe('isHighImportance', () => {
  test('returns true when score exceeds threshold', () => {
    const article = makeArticle({ score: 0.9 });
    assert.equal(isHighImportance(article, IMPORTANCE_CONFIG), true);
  });

  test('returns true when topic is in trigger list', () => {
    const article = makeArticle({ score: 0.3, topics: ['defense'] });
    assert.equal(isHighImportance(article, IMPORTANCE_CONFIG), true);
  });

  test('returns false when score is below threshold and no trigger topics', () => {
    const article = makeArticle({ score: 0.4, topics: ['housing'] });
    assert.equal(isHighImportance(article, IMPORTANCE_CONFIG), false);
  });
});

// ─── dedupe.js ────────────────────────────────────────────────────────────────

describe('dedupeArticles', () => {
  test('identical titles are deduplicated', () => {
    const articles = [
      makeArticle({ title: 'Fed Raises Rates', url: 'https://a.com' }),
      makeArticle({ title: 'Fed Raises Rates', url: 'https://b.com' })
    ];
    const { unique, total } = dedupeArticles(articles);
    assert.equal(total, 2);
    assert.equal(unique.length, 1);
  });

  test('near-duplicate titles are deduplicated', () => {
    const articles = [
      makeArticle({ title: 'Federal Reserve raises interest rates', url: 'https://a.com' }),
      makeArticle({ title: 'Federal Reserve raises interest rates again', url: 'https://b.com' })
    ];
    const { unique } = dedupeArticles(articles);
    assert.equal(unique.length, 1);
  });

  test('distinct articles are preserved', () => {
    const articles = [
      makeArticle({ title: 'Fed Raises Rates', url: 'https://a.com' }),
      makeArticle({ title: 'Apple Earnings Beat Expectations', url: 'https://b.com' }),
      makeArticle({ title: 'Ukraine War Latest Developments', url: 'https://c.com' })
    ];
    const { unique } = dedupeArticles(articles);
    assert.equal(unique.length, 3);
  });

  test('duplicate articles are marked with duplicate=true', () => {
    const articles = [
      makeArticle({ title: 'Fed Raises Rates', url: 'https://a.com' }),
      makeArticle({ title: 'Fed Raises Rates', url: 'https://b.com' })
    ];
    dedupeArticles(articles);
    assert.equal(articles[1].duplicate, true);
  });

  test('returns correct total count', () => {
    const articles = Array.from({ length: 5 }, (_, i) =>
      makeArticle({ title: `Unique Story ${i}`, url: `https://example.com/${i}` })
    );
    const { total } = dedupeArticles(articles);
    assert.equal(total, 5);
  });

  test('exact URL match deduplicates before Jaccard check', () => {
    const articles = [
      makeArticle({ title: 'Story A', url: 'https://example.com/story' }),
      makeArticle({ title: 'Completely Different Headline', url: 'https://example.com/story' })
    ];
    const { unique } = dedupeArticles(articles);
    assert.equal(unique.length, 1, 'same URL should be deduped regardless of title');
  });

  test('BREAKING: prefix does not prevent dedup', () => {
    const articles = [
      makeArticle({ title: 'Federal Reserve Raises Rates', url: 'https://a.com' }),
      makeArticle({ title: 'BREAKING: Federal Reserve Raises Rates', url: 'https://b.com' })
    ];
    const { unique } = dedupeArticles(articles);
    assert.equal(unique.length, 1, 'BREAKING: prefix should be stripped before comparison');
  });

  test('UPDATE: and EXCLUSIVE: prefixes are stripped', () => {
    const articles = [
      makeArticle({ title: 'Oil Prices Surge on OPEC Decision', url: 'https://a.com' }),
      makeArticle({ title: 'UPDATE: Oil Prices Surge on OPEC Decision', url: 'https://b.com' }),
      makeArticle({ title: 'EXCLUSIVE: Oil Prices Surge on OPEC Decision', url: 'https://c.com' })
    ];
    const { unique } = dedupeArticles(articles);
    assert.equal(unique.length, 1, 'UPDATE:/EXCLUSIVE: prefixes should be stripped');
  });
});

// ─── entities.js ─────────────────────────────────────────────────────────────

describe('extractEntitiesSync', () => {
  test('extracts known ticker symbols', () => {
    const result = extractEntitiesSync('AAPL and MSFT hit record highs', '');
    assert.ok(result.tickers.includes('AAPL'), 'should extract AAPL');
    assert.ok(result.tickers.includes('MSFT'), 'should extract MSFT');
  });

  test('extracts known countries', () => {
    const result = extractEntitiesSync('Tensions rise between China and Taiwan', '');
    assert.ok(result.countries.some((c) => c.toLowerCase() === 'china'), 'should extract China');
    assert.ok(result.countries.some((c) => c.toLowerCase() === 'taiwan'), 'should extract Taiwan');
  });

  test('extracts known organizations', () => {
    const result = extractEntitiesSync('Federal Reserve signals rate pause', '');
    assert.ok(result.orgs.some((o) => o.toLowerCase().includes('federal reserve')), 'should extract Fed');
  });

  test('returns empty arrays when nothing matches', () => {
    const result = extractEntitiesSync('local school board meeting tonight', '');
    assert.deepEqual(result.tickers, []);
    assert.deepEqual(result.people, []);
  });

  test('result has expected shape', () => {
    const result = extractEntitiesSync('test headline', '');
    for (const key of ['people', 'orgs', 'countries', 'tickers']) {
      assert.ok(Array.isArray(result[key]), `result.${key} should be an array`);
    }
  });
});

describe('entityOverlapScore', () => {
  test('identical entities return 1', () => {
    const e = { people: ['Alice'], orgs: ['Fed'], countries: ['US'], tickers: ['AAPL'] };
    assert.equal(entityOverlapScore(e, e), 1);
  });

  test('no overlap returns 0', () => {
    const a = { people: ['Alice'], orgs: [], countries: [], tickers: [] };
    const b = { people: ['Bob'], orgs: [], countries: [], tickers: [] };
    assert.equal(entityOverlapScore(a, b), 0);
  });

  test('partial overlap returns value between 0 and 1', () => {
    const a = { people: [], orgs: ['Fed', 'SEC'], countries: ['US'], tickers: [] };
    const b = { people: [], orgs: ['Fed'], countries: ['US', 'China'], tickers: [] };
    const score = entityOverlapScore(a, b);
    assert.ok(score > 0 && score < 1, `expected 0 < score < 1, got ${score}`);
  });

  test('handles null inputs gracefully', () => {
    assert.equal(entityOverlapScore(null, { people: [], orgs: [], countries: [], tickers: [] }), 0);
    assert.equal(entityOverlapScore(null, null), 0);
  });
});

describe('mergeEntities', () => {
  test('returns sync result when ai is null', () => {
    const sync = { people: [], orgs: ['Fed'], countries: ['US'], tickers: ['AAPL'] };
    assert.deepEqual(mergeEntities(sync, null), sync);
  });

  test('merges and deduplicates across sync and ai', () => {
    const sync = { people: [], orgs: ['Federal Reserve'], countries: ['US'], tickers: ['AAPL'] };
    const ai = { people: ['Jerome Powell'], orgs: ['Federal Reserve', 'SEC'], countries: ['US'], tickers: [] };
    const merged = mergeEntities(sync, ai);
    assert.ok(merged.people.includes('Jerome Powell'));
    assert.ok(merged.orgs.some((o) => o.toLowerCase().includes('federal reserve')));
    // Fed should not be doubled
    const fedCount = merged.orgs.filter((o) => o.toLowerCase().includes('federal reserve')).length;
    assert.equal(fedCount, 1, 'Federal Reserve should appear exactly once after merge');
  });
});

// ─── rss.js (parseFeed) ───────────────────────────────────────────────────────

describe('parseFeed', () => {
  const RSS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Fed Raises Rates by 25bps</title>
      <link>https://example.com/story-1</link>
      <description>The Federal Reserve raised rates.</description>
      <pubDate>Fri, 01 Mar 2024 12:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Oil Prices Surge on OPEC Decision</title>
      <link>https://example.com/story-2</link>
      <description>OPEC+ agreed to cut production.</description>
      <pubDate>Fri, 01 Mar 2024 11:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

  const ATOM_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Test Atom Feed</title>
  <entry>
    <title>Apple Reports Record Quarterly Earnings</title>
    <link rel="alternate" href="https://example.com/apple-earnings"/>
    <summary>Apple beat analyst expectations.</summary>
    <updated>2024-03-01T10:00:00Z</updated>
  </entry>
</feed>`;

  test('parses RSS 2.0 feed and returns items', () => {
    const items = parseFeed(RSS_FIXTURE);
    assert.equal(items.length, 2);
    assert.equal(items[0].title, 'Fed Raises Rates by 25bps');
    assert.equal(items[0].link, 'https://example.com/story-1');
    assert.ok(items[0].summary.length > 0, 'should have summary');
    assert.ok(items[0].published, 'should have published date');
  });

  test('parses Atom feed and returns entries', () => {
    const items = parseFeed(ATOM_FIXTURE);
    assert.equal(items.length, 1);
    assert.equal(items[0].title, 'Apple Reports Record Quarterly Earnings');
    assert.equal(items[0].link, 'https://example.com/apple-earnings');
  });

  test('returns empty array for empty XML', () => {
    const items = parseFeed('<?xml version="1.0"?><root/> ');
    assert.deepEqual(items, []);
  });

  test('returns empty array for empty string', () => {
    const items = parseFeed('');
    assert.deepEqual(items, []);
  });
});

// ─── sanitize.js ──────────────────────────────────────────────────────────────

describe('stripHtml', () => {
  test('removes HTML tags', () => {
    assert.equal(stripHtml('<p>Hello <strong>world</strong></p>'), 'Hello world');
  });

  test('decodes &amp; correctly (not replaced with space)', () => {
    const result = stripHtml('Cats &amp; Dogs');
    assert.equal(result, 'Cats & Dogs');
  });

  test('decodes &lt; and &gt;', () => {
    const result = stripHtml('Price &lt; $100 &amp; stock &gt; 0');
    assert.equal(result, 'Price < $100 & stock > 0');
  });

  test('decodes &nbsp; to a regular space', () => {
    const result = stripHtml('Word1&nbsp;Word2');
    assert.equal(result, 'Word1 Word2');
  });

  test('decodes numeric entities', () => {
    // &#38; = &, &#x26; = &
    assert.equal(stripHtml('A&#38;B'), 'A&B');
    assert.equal(stripHtml('A&#x26;B'), 'A&B');
  });

  test('strips script tag content entirely', () => {
    const result = stripHtml('<p>Article</p><script>alert("xss")</script>');
    assert.ok(!result.includes('alert'), 'script content should be removed');
    assert.ok(result.includes('Article'), 'non-script content should remain');
  });

  test('strips style tag content entirely', () => {
    const result = stripHtml('<style>body{color:red}</style><p>Content</p>');
    assert.ok(!result.includes('color'), 'style content should be removed');
    assert.ok(result.includes('Content'));
  });

  test('collapses whitespace', () => {
    assert.equal(stripHtml('  too   many   spaces  '), 'too many spaces');
  });

  test('handles empty string', () => {
    assert.equal(stripHtml(''), '');
  });

  test('handles plain text with no HTML', () => {
    assert.equal(stripHtml('Just plain text.'), 'Just plain text.');
  });
});

describe('safeText', () => {
  test('truncates to default max length (1000)', () => {
    const long = 'a'.repeat(2000);
    const result = safeText(long);
    assert.ok(result.length <= 1000);
  });

  test('accepts custom max length', () => {
    const result = safeText('Hello world', 5);
    assert.equal(result, 'Hello');
  });

  test('strips HTML before truncating', () => {
    const result = safeText('<b>Bold text</b>');
    assert.equal(result, 'Bold text');
  });

  test('CDATA-wrapped HTML is cleaned', () => {
    // fast-xml-parser unwraps CDATA, so safeText gets the raw HTML
    const result = safeText('<strong>Breaking</strong>: Fed raises rates');
    assert.ok(!result.includes('<strong>'), 'HTML tags should be gone');
    assert.ok(result.includes('Breaking'), 'text content should remain');
  });
});
