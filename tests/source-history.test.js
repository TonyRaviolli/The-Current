import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSourceHistoryProfile, summarizeSourceHistory } from '../src/lib/source-history.js';

test('buildSourceHistoryProfile infers official feed history for primary rss sources', () => {
  const profile = buildSourceHistoryProfile({
    id: 'whitehouse',
    name: 'White House',
    type: 'rss',
    sourceType: 'primary',
    enabled: true,
    tier: 1
  });

  assert.equal(profile.historyMode, 'official-feed');
  assert.equal(profile.backfillable, true);
  assert.equal(profile.retentionDays, 365);
});

test('summarizeSourceHistory aggregates modes and backfillable counts', () => {
  const summary = summarizeSourceHistory([
    { id: 'a', name: 'A', type: 'rss', sourceType: 'primary', tier: 1, enabled: true },
    { id: 'b', name: 'B', type: 'rss', sourceType: 'secondary', tier: 2, enabled: true },
    { id: 'c', name: 'C', type: 'html', sourceType: 'secondary', tier: 2, enabled: false }
  ]);

  assert.equal(summary.total, 3);
  assert.equal(summary.backfillable, 2);
  assert.equal(summary.byMode['official-feed'], 1);
  assert.equal(summary.byMode['rolling-rss'], 1);
  assert.equal(summary.byMode.none, 1);
});
