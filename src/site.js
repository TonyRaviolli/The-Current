import { writeFile } from 'node:fs/promises';
import { info } from './lib/logger.js';

export async function writeSitemap(store, baseUrl) {
  const pages = [
    '/',
    '/#archive',
    '/#topics',
    '/#about',
    '/#resources',
    '/#contact'
  ];
  const storyUrls = (store.stories || []).slice(0, 100).map((story) => `/story/${story.slug}`);
  const digestUrls = store.digest ? ['/digest/latest'] : [];
  const all = pages.concat(storyUrls, digestUrls);
  const urls = all.map((path) => `<url><loc>${baseUrl}${path}</loc></url>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  await writeFile('sitemap.xml', xml);
  info('sitemap_written', { count: all.length });
}

export async function writeRobots(baseUrl) {
  const content = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;
  await writeFile('robots.txt', content);
  info('robots_written');
}

export async function writeSiteFeed(store, baseUrl) {
  const items = (store.stories || []).slice(0, 20).map((item) => {
    const title = escapeXml(item.headline || item.title);
    const link = escapeXml(`${baseUrl}/story/${item.slug}`);
    const description = escapeXml(item.dek || '');
    const pubDate = new Date(item.updatedAt || Date.now()).toUTCString();
    return `<item><title>${title}</title><link>${link}</link><guid>${item.id}</guid><pubDate>${pubDate}</pubDate><description>${description}</description></item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0"><channel><title>The UnderCurrent Feed</title><link>${baseUrl}</link><description>Daily intelligence briefing</description>${items}</channel></rss>`;
  await writeFile('site-feed.xml', rss);
  info('site_feed_written', { count: (store.stories || []).length });
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
