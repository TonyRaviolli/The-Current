import { createHash } from 'node:crypto';

export function normalizeUrl(rawUrl = '') {
  try {
    const url = new URL(rawUrl);
    url.hash = '';
    url.searchParams.sort();
    return url.toString().replace(/\/$/, '');
  } catch {
    return rawUrl.trim();
  }
}

export function normalizeTitle(title = '') {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeTitle(title = '') {
  return new Set(normalizeTitle(title).split(' ').filter(Boolean));
}

export function jaccardSimilarity(a, b) {
  const aSet = tokenizeTitle(a);
  const bSet = tokenizeTitle(b);
  if (!aSet.size || !bSet.size) return 0;
  let intersection = 0;
  for (const token of aSet) {
    if (bSet.has(token)) intersection += 1;
  }
  const union = aSet.size + bSet.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function stableId(parts = []) {
  const hash = createHash('sha256');
  hash.update(parts.join('|'));
  return hash.digest('hex').slice(0, 16);
}

export function slugify(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
