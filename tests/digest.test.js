import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDigestEmail } from '../src/lib/digest.js';

test('buildDigestEmail returns html', () => {
  const digest = {
    summary: 'Top stories of the week.',
    top10: [{ headline: 'Story A', sources: [{ name: 'Reuters' }] }],
    marketRecap: [],
    policyRecap: []
  };
  const html = buildDigestEmail(digest);
  assert.ok(html.includes('<html>'));
  assert.ok(html.includes('Story A'));
});
