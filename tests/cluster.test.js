import test from 'node:test';
import assert from 'node:assert/strict';
import { clusterArticles } from '../src/lib/cluster.js';

const base = {
  source: 'Reuters',
  sourceId: 'reuters',
  tier: 1,
  topics: ['economy'],
  orientation: 'center',
  sourceType: 'primary'
};

test('clusterArticles groups similar titles', () => {
  const articles = [
    { ...base, id: '1', title: 'Fed signals rate pause', summary: '', url: 'a', publishedAt: '2026-02-20T10:00:00Z', score: 0.8 },
    { ...base, id: '2', title: 'Fed signals rate pause as inflation cools', summary: '', url: 'b', publishedAt: '2026-02-20T12:00:00Z', score: 0.7 }
  ];
  const clusters = clusterArticles(articles, { similarityThreshold: 0.6, maxHours: 48 });
  assert.equal(clusters.length, 1);
  assert.equal(clusters[0].items.length, 2);
});
