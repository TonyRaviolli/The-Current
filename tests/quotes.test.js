import test from 'node:test';
import assert from 'node:assert/strict';
import { selectDailyInsight } from '../src/lib/quotes.js';

test('selectDailyInsight returns text and source', () => {
  const quote = selectDailyInsight(['economy']);
  assert.ok(quote.text.length > 0);
  assert.ok(quote.source.length > 0);
});
