import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { appendToArchive, loadArchive, summarizeArchive } from '../src/lib/archive.js';

test('appendToArchive groups stories by published day and merges duplicates', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'uc-archive-'));
  const stories = [
    {
      id: 'a',
      slug: 'story-a',
      url: 'https://example.com/a',
      headline: 'Story A',
      imageUrl: 'https://example.com/a.jpg',
      score: 0.7,
      topics: ['economy'],
      sources: [{ name: 'Reuters', tier: 1 }],
      publishedAt: '2026-03-10T08:00:00.000Z',
      updatedAt: '2026-03-10T08:00:00.000Z',
      tier: 1
    },
    {
      id: 'b',
      slug: 'story-b',
      url: 'https://example.com/b',
      headline: 'Story B',
      score: 0.6,
      topics: ['law'],
      sources: [{ name: 'AP', tier: 1 }],
      publishedAt: '2026-03-09T18:00:00.000Z',
      updatedAt: '2026-03-09T18:00:00.000Z',
      tier: 1
    }
  ];

  await appendToArchive(stories, dir);
  await appendToArchive([
    {
      ...stories[0],
      score: 0.9,
      updatedAt: '2026-03-10T12:00:00.000Z'
    }
  ], dir);

  const archive = await loadArchive(dir);
  assert.equal(archive.days.length, 2);
  assert.equal(archive.days[0].date, '2026-03-10');
  assert.equal(archive.days[1].date, '2026-03-09');
  assert.equal(archive.days[0].stories.length, 1);
  assert.equal(archive.days[0].stories[0].score, 0.9);
  assert.equal(archive.days[0].stories[0].imageUrl, 'https://example.com/a.jpg');

  const summary = summarizeArchive(archive);
  assert.deepEqual(summary, {
    days: 2,
    stories: 2,
    newestDate: '2026-03-10',
    oldestDate: '2026-03-09'
  });

  const raw = JSON.parse(await readFile(path.join(dir, 'archive.json'), 'utf8'));
  assert.equal(raw.days.length, 2);
});
