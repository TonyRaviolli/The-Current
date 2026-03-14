import test from 'node:test';
import assert from 'node:assert/strict';
import { dedupeArticles } from '../src/lib/dedupe.js';

const items = [
  { title: 'Fed announces rate hold' },
  { title: 'Fed announces rate hold' },
  { title: 'Fed announces rate hike' }
];

test('dedupe removes exact matches', () => {
  const { unique } = dedupeArticles(items, 0.9);
  assert.equal(unique.length, 2);
});
