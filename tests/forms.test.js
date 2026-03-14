import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, validateSource, validateTopic } from '../src/lib/forms.js';

test('validateContact detects missing fields', () => {
  const errors = validateContact({ name: '', email: 'bad', message: '' });
  assert.ok(errors.includes('name'));
  assert.ok(errors.includes('email'));
  assert.ok(errors.includes('message'));
});

test('validateSource accepts valid payload', () => {
  const errors = validateSource({ name: 'Example', url: 'https://example.com', rationale: 'Legit source coverage.' });
  assert.equal(errors.length, 0);
});

test('validateTopic requires context', () => {
  const errors = validateTopic({ topic: 'AI', context: '' });
  assert.ok(errors.includes('context'));
});
