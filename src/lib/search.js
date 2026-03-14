export function buildSearchIndex(stories = []) {
  return stories.map((story) => ({
    id: story.id,
    type: 'story',
    slug: story.slug,
    title: (story.headline || '').toLowerCase(),
    summary: (story.dek || '').toLowerCase(),
    source: (story.sources || []).map((s) => (s.name || '').toLowerCase()).join(' '),
    tags: (story.topics || []).join(' ').toLowerCase(),
    tier: story.tier,
    date: story.updatedAt || story.publishedAt,
    url: story.canonicalUrl || `/story/${story.slug}`
  }));
}

export function searchIndex(index, query, filters = {}) {
  const q = query.trim().toLowerCase();
  const { tier, topic, fromDate, toDate, tab, source } = filters;

  return index.filter((item) => {
    const textMatch = !q || item.title.includes(q) || item.summary.includes(q) || item.source.includes(q) || item.tags.includes(q);
    if (!textMatch) return false;
    if (tier && String(item.tier) !== String(tier)) return false;
    if (topic && !item.tags.includes(topic.toLowerCase())) return false;
    if (source && !item.source.includes(source.toLowerCase())) return false;
    if (fromDate && item.date && item.date < fromDate) return false;
    if (toDate && item.date && item.date > toDate) return false;
    if (tab && item.tab !== tab) return false;
    return true;
  });
}
