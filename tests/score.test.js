import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreArticle, isHighImportance } from '../src/lib/score.js';

const config = {
  recencyHalfLifeHours: 10,
  topicBoosts: { economy: 0.1 },
  localRegionBoost: 0.08,
  duplicatePenalty: 0.15,
  tierWeights: { '1': 1, '2': 0.8, '3': 0.6 }
};

test('scoreArticle returns bounded score', () => {
  const article = { publishedAt: new Date().toISOString(), tier: 1, topics: ['economy'], duplicate: false, region: 'US-CA' };
  const { score } = scoreArticle(article, config, 'US-CA');
  assert.ok(score <= 1 && score >= 0);
});

test('isHighImportance respects threshold', () => {
  const article = { score: 0.8, topics: ['economy'] };
  const importance = { scoreThreshold: 0.7, topicTriggers: ['defense'] };
  assert.equal(isHighImportance(article, importance), true);
});
