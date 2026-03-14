import test from 'node:test';
import assert from 'node:assert/strict';
import { canFetchSource, recordSourceFailure } from '../src/lib/http.js';

const breaker = { failureThreshold: 2, cooldownMs: 1000 };

test('circuit breaker blocks after threshold', () => {
  const cache = { sources: {} };
  recordSourceFailure(cache, 'source');
  recordSourceFailure(cache, 'source');
  const allowed = canFetchSource(cache.sources['source'], breaker);
  assert.equal(allowed, false);
});
