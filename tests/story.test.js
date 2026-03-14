import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStories } from '../src/lib/story.js';

const cluster = {
  id: 'cluster1',
  lead: {
    title: 'Senate passes AI bill',
    summary: 'Landmark AI regulation advances.',
    publishedAt: '2026-02-20T10:00:00Z',
    score: 0.85,
    tier: 1,
    scoreBreakdown: { tierWeight: 1, recency: 1 }
  },
  items: [
    {
      title: 'Senate passes AI bill',
      summary: 'Landmark AI regulation advances.',
      publishedAt: '2026-02-20T10:00:00Z',
      score: 0.85,
      tier: 1,
      source: 'AP',
      sourceId: 'ap',
      sourceType: 'primary',
      orientation: 'center',
      topics: ['tech', 'uspolitics'],
      url: 'https://example.com/ap'
    }
  ],
  topics: ['tech', 'uspolitics'],
  updatedAt: '2026-02-20T12:00:00Z'
};

test('buildStories creates slug and verification', () => {
  const stories = buildStories([cluster], { baseUrl: 'http://localhost:5173' });
  assert.equal(stories.length, 1);
  assert.ok(stories[0].slug.includes('senate-passes-ai-bill'));
  assert.equal(stories[0].verificationTier, 'Primary');
});
