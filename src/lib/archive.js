import { loadJson, saveJson } from './store.js';
import path from 'node:path';

const MAX_DAYS = 365;
const MAX_STORIES_PER_DAY = 80;

/**
 * Append today's top stories to the rolling archive file.
 * If an entry for today already exists it is replaced with fresher data.
 * The file keeps at most MAX_DAYS calendar days.
 */
export async function appendToArchive(stories, dataDir = './data') {
  const archivePath = path.join(dataDir, 'archive.json');
  const archive = await loadJson(archivePath, { days: [] });
  const byDate = new Map((archive.days || []).map((day) => [day.date, { ...day, stories: [...(day.stories || [])] }]));

  for (const story of stories || []) {
    const date = archiveDateForStory(story);
    if (!date) continue;
    if (!byDate.has(date)) byDate.set(date, { date, count: 0, stories: [] });
    const day = byDate.get(date);
    mergeStoryIntoDay(day, compactStory(story));
  }

  archive.days = Array.from(byDate.values())
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, MAX_DAYS)
    .map((day) => ({
      ...day,
      stories: (day.stories || [])
        .slice()
        .sort((a, b) => (b.score || 0) - (a.score || 0) || String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || '')))
        .slice(0, MAX_STORIES_PER_DAY),
      count: (day.stories || []).length
    }));

  await saveJson(archivePath, archive);
  return archive;
}

/**
 * Load the rolling archive. Returns { days: [] } if the file does not yet exist.
 */
export async function loadArchive(dataDir = './data') {
  const archivePath = path.join(dataDir, 'archive.json');
  return loadJson(archivePath, { days: [] });
}

export function summarizeArchive(archive = { days: [] }) {
  const days = archive.days || [];
  const dates = days.map((day) => day.date).filter(Boolean).sort();
  const storyCount = days.reduce((sum, day) => sum + ((day.stories || []).length || 0), 0);
  return {
    days: days.length,
    stories: storyCount,
    newestDate: dates[dates.length - 1] || null,
    oldestDate: dates[0] || null
  };
}

function compactStory(s) {
  return {
    id: s.id,
    slug: s.slug,
    url: s.url || '',
    imageUrl: s.imageUrl || '',
    headline: s.headline,
    dek: s.dek || '',
    score: s.score,
    topics: (s.topics || []).slice(0, 3),
    sources: (s.sources || []).slice(0, 2).map((src) => ({ name: src.name, tier: src.tier })),
    publishedAt: s.publishedAt,
    updatedAt: s.updatedAt,
    tier: s.tier,
    verificationTier: s.verificationTier || ''
  };
}

function archiveDateForStory(story) {
  const iso = story?.publishedAt || story?.updatedAt;
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function mergeStoryIntoDay(day, story) {
  const index = (day.stories || []).findIndex((item) => item.id === story.id);
  if (index === -1) {
    day.stories.push(story);
    day.count = (day.count || 0) + 1;
    return;
  }

  const existing = day.stories[index];
  const existingScore = existing?.score || 0;
  const nextScore = story?.score || 0;
  const existingUpdated = String(existing?.updatedAt || existing?.publishedAt || '');
  const nextUpdated = String(story?.updatedAt || story?.publishedAt || '');
  if (nextScore > existingScore || nextUpdated > existingUpdated) {
    day.stories[index] = { ...existing, ...story };
  }
}
