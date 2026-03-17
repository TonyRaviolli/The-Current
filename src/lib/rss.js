import { XMLParser } from 'fast-xml-parser';
import { safeText } from './sanitize.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'text'
});

function normalizeItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  return [items];
}

/**
 * Sanitise an image URL — only allow http/https to prevent injection.
 */
function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

/**
 * Attempt to extract a primary image URL from a raw feed item.
 * Checks (in order): enclosure, media:content, media:thumbnail, <img> in description.
 */
function extractImageUrl(item) {
  // 1. <enclosure> — common in podcasts and image-heavy feeds
  const enc = item.enclosure;
  if (enc && typeof enc === 'string') {
    const url = sanitizeImageUrl(enc);
    if (url) return url;
  } else if (enc && typeof enc === 'object') {
    const url = sanitizeImageUrl(enc.url || '');
    const type = String(enc.type || '');
    if (url && (type.startsWith('image/') || !type)) return url;
  }

  // 2. <media:content> — media namespace (fast-xml-parser preserves colon names)
  const mc = item['media:content'];
  if (mc) {
    const entries = Array.isArray(mc) ? mc : [mc];
    // Collect all image entries with their resolution, pick the largest
    let best = null;
    let bestArea = 0;
    for (const entry of entries) {
      if (typeof entry !== 'object') continue;
      const url = sanitizeImageUrl(entry.url || '');
      const medium = String(entry.medium || '');
      const type = String(entry.type || '');
      if (!url) continue;
      const isImage = medium === 'image' || type.startsWith('image/') || !medium;
      if (!isImage) continue;
      const w = parseInt(entry.width, 10) || 0;
      const h = parseInt(entry.height, 10) || 0;
      const area = w * h;
      if (area > bestArea || !best) {
        best = url;
        bestArea = area;
      }
    }
    if (best) return best;
  }

  // 2b. <media:group> → <media:content> (used by Google News, YouTube, etc.)
  const mg = item['media:group'];
  if (mg) {
    const mgContent = mg['media:content'];
    if (mgContent) {
      const entries = Array.isArray(mgContent) ? mgContent : [mgContent];
      let best = null;
      let bestArea = 0;
      for (const entry of entries) {
        if (typeof entry !== 'object') continue;
        const url = sanitizeImageUrl(entry.url || '');
        if (!url) continue;
        const w = parseInt(entry.width, 10) || 0;
        const h = parseInt(entry.height, 10) || 0;
        const area = w * h;
        if (area > bestArea || !best) { best = url; bestArea = area; }
      }
      if (best) return best;
    }
  }

  // 3. <media:thumbnail> — pick largest if multiple sizes provided
  const mt = item['media:thumbnail'];
  if (mt) {
    const entries = Array.isArray(mt) ? mt : [mt];
    let best = null;
    let bestArea = 0;
    for (const entry of entries) {
      const url = sanitizeImageUrl(typeof entry === 'object' ? (entry.url || '') : entry);
      if (!url) continue;
      if (typeof entry === 'object') {
        const w = parseInt(entry.width, 10) || 0;
        const h = parseInt(entry.height, 10) || 0;
        const area = w * h;
        if (area > bestArea || !best) { best = url; bestArea = area; }
      } else if (!best) {
        best = url;
      }
    }
    if (best) return best;
  }

  // 4. First <img src="..."> found in description HTML
  const rawDesc = item.description;
  const desc = typeof rawDesc === 'string' ? rawDesc : (rawDesc?.text || '');
  if (desc) {
    const match = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1]) return sanitizeImageUrl(match[1]);
  }

  return null;
}

function extractRssItems(data) {
  const items = normalizeItems(data?.rss?.channel?.item);
  return items.map((item) => ({
    title: safeText(item.title?.text || item.title || ''),
    link: item.link?.text || item.link || '',
    summary: safeText(item.description?.text || item.description || ''),
    published: item.pubDate?.text || item.pubDate || item['dc:date'] || null,
    imageUrl: extractImageUrl(item)
  }));
}

function extractAtomItems(data) {
  const entries = normalizeItems(data?.feed?.entry);
  return entries.map((entry) => {
    const link = Array.isArray(entry.link)
      ? entry.link.find((l) => l.rel === 'alternate')?.href || entry.link[0]?.href
      : entry.link?.href;
    return {
      title: safeText(entry.title?.text || entry.title || ''),
      link: link || '',
      summary: safeText(entry.summary?.text || entry.summary || entry.content?.text || ''),
      published: entry.updated?.text || entry.published?.text || entry.updated || entry.published || null,
      imageUrl: extractImageUrl(entry)
    };
  });
}

export function parseFeed(xml) {
  const data = parser.parse(xml);
  if (data?.rss) return extractRssItems(data);
  if (data?.feed) return extractAtomItems(data);
  return [];
}
