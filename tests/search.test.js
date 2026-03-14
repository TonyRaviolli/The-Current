import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex, searchIndex } from '../src/lib/search.js';

const liveStories = [
  { id: '1', headline: 'AI bill advances', dek: 'Senate update', sources: [{ name: 'Reuters' }], topics: ['tech'], tier: 1, updatedAt: '2026-02-19', slug: 'ai-bill' },
  { id: '2', headline: 'Oil prices dip', dek: 'Energy market', sources: [{ name: 'AP' }], topics: ['energy'], tier: 2, updatedAt: '2026-02-18', slug: 'oil-prices' }
];

const archiveStories = [
  { id: '3', headline: 'Trade deal signed', dek: 'Historic agreement', sources: [{ name: 'FT' }], topics: ['economy'], tier: 1, publishedAt: '2026-01-15', slug: 'trade-deal' }
];

test('buildSearchIndex accepts story array directly', () => {
  const index = buildSearchIndex(liveStories);
  assert.equal(index.length, 2);
  assert.equal(index[0].id, '1');
});

test('searchIndex filters by query — live stories', () => {
  const index = buildSearchIndex(liveStories);
  const results = searchIndex(index, 'ai');
  assert.equal(results.length, 1);
  assert.equal(results[0].id, '1');
});

test('searchIndex finds archive stories (publishedAt fallback)', () => {
  const index = buildSearchIndex([...liveStories, ...archiveStories]);
  const results = searchIndex(index, 'trade');
  assert.equal(results.length, 1);
  assert.equal(results[0].id, '3');
  assert.equal(results[0].date, '2026-01-15');
});

test('searchIndex deduplication: live id shadows archive id', () => {
  const liveIds = new Set(liveStories.map((s) => s.id));
  const dedupedArchive = archiveStories.filter((s) => !liveIds.has(s.id));
  const index = buildSearchIndex([...liveStories, ...dedupedArchive]);
  assert.equal(index.length, 3);
});

test('searchIndex filters by tier', () => {
  const index = buildSearchIndex(liveStories);
  const results = searchIndex(index, '', { tier: '2' });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, '2');
});

test('searchIndex filters by topic', () => {
  const index = buildSearchIndex([...liveStories, ...archiveStories]);
  const results = searchIndex(index, '', { topic: 'economy' });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, '3');
});

test('searchIndex returns empty for no match', () => {
  const index = buildSearchIndex(liveStories);
  const results = searchIndex(index, 'quantum entanglement xyz');
  assert.equal(results.length, 0);
});
