import test from 'node:test';
import assert from 'node:assert/strict';
import { startOfIsoWeek, endOfIsoWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, isoWeekToDateRange, inRange } from '../assets/dateRanges.js';

test('iso week range anchors to Monday and Sunday UTC', () => {
  const date = new Date('2026-02-21T12:00:00Z');
  const start = startOfIsoWeek(date);
  const end = endOfIsoWeek(date);
  assert.equal(start.getUTCDay(), 1);
  assert.equal(end.getUTCDay(), 0);
  assert.ok(start < end);
});

test('month boundaries are calendar-correct', () => {
  const date = new Date('2026-02-21T12:00:00Z');
  assert.equal(startOfMonth(date).toISOString(), '2026-02-01T00:00:00.000Z');
  assert.equal(endOfMonth(date).toISOString(), '2026-02-28T23:59:59.999Z');
});

test('quarter boundaries are calendar-correct', () => {
  const date = new Date('2026-05-10T12:00:00Z');
  assert.equal(startOfQuarter(date).toISOString(), '2026-04-01T00:00:00.000Z');
  assert.equal(endOfQuarter(date).toISOString(), '2026-06-30T23:59:59.999Z');
});

test('isoWeekToDateRange parses year-week keys', () => {
  const range = isoWeekToDateRange('2026-W8');
  assert.ok(range);
  assert.equal(range.start.toISOString(), '2026-02-16T00:00:00.000Z');
  assert.equal(range.end.toISOString(), '2026-02-22T23:59:59.999Z');
  assert.equal(inRange('2026-02-20T10:00:00Z', range.start, range.end), true);
});
