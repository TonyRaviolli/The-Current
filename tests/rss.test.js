import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFeed } from '../src/lib/rss.js';

const SAMPLE_RSS = `<?xml version="1.0"?><rss><channel><item><title>Test Story</title><link>https://example.com/story</link><description>Summary</description><pubDate>Wed, 19 Feb 2026 10:00:00 GMT</pubDate></item></channel></rss>`;

test('parseFeed extracts RSS items', () => {
  const items = parseFeed(SAMPLE_RSS);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Test Story');
  assert.equal(items[0].link, 'https://example.com/story');
});
