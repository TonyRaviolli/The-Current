// ── Feed size caps (adjust here to change across all tier sections) ───────────
const FEED_MAX_STORIES = 15; // total articles shown across Tier 1/2/3
const FEED_MAX_PER_TIER = 5; // target per tier before overflow fills remaining slots

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function groupStoriesByDate(stories = []) {
  const groups = new Map();
  for (const story of stories) {
    const key = String(story.updatedAt || story.publishedAt || '').slice(0, 10) || 'unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(story);
  }
  return Array.from(groups.entries())
    .sort((a, b) => String(b[0]).localeCompare(String(a[0])))
    .map(([date, items]) => ({
      date,
      label: date && date !== 'unknown' ? formatDate(date) : 'Undated',
      items: items
        .slice()
        .sort((a, b) => (b.score || 0) - (a.score || 0) || String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || '')))
    }));
}

// ── Topic-keyed SVG fallback icons ───────────────────────────────────────────
function getTopicSvgIcon(topics) {
  const t = (topics || []).map((x) => String(x).toLowerCase());
  if (t.some((x) => ['finance', 'economy', 'macroeconomics', 'banking', 'markets'].includes(x)))
    return `<polyline points="8,56 24,40 40,48 56,24 72,32 88,12" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="88" cy="12" r="4" fill="currentColor"/>`;
  if (t.some((x) => ['ai', 'tech', 'technology', 'cyber', 'engineering'].includes(x)))
    return `<rect x="26" y="26" width="44" height="44" rx="6" fill="none" stroke-width="2"/><circle cx="48" cy="48" r="10" fill="none" stroke-width="2"/><line x1="48" y1="26" x2="48" y2="36" stroke-width="2.5" stroke-linecap="round"/><line x1="48" y1="60" x2="48" y2="70" stroke-width="2.5" stroke-linecap="round"/><line x1="26" y1="48" x2="36" y2="48" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="48" x2="70" y2="48" stroke-width="2.5" stroke-linecap="round"/>`;
  if (t.some((x) => ['health', 'biotech'].includes(x)))
    return `<line x1="48" y1="18" x2="48" y2="78" stroke-width="3" stroke-linecap="round"/><line x1="18" y1="48" x2="78" y2="48" stroke-width="3" stroke-linecap="round"/><circle cx="48" cy="48" r="22" fill="none" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.5"/>`;
  if (t.some((x) => ['geopolitics', 'international', 'global_trade', 'defense'].includes(x)))
    return `<circle cx="48" cy="48" r="26" fill="none" stroke-width="2"/><ellipse cx="48" cy="48" rx="13" ry="26" fill="none" stroke-width="1.5"/><line x1="22" y1="48" x2="74" y2="48" stroke-width="1.5"/><line x1="24" y1="36" x2="72" y2="36" stroke-width="1" opacity="0.6"/><line x1="24" y1="60" x2="72" y2="60" stroke-width="1" opacity="0.6"/>`;
  if (t.some((x) => ['law', 'elections', 'uspolitics'].includes(x)))
    return `<line x1="48" y1="22" x2="48" y2="74" stroke-width="2" stroke-linecap="round"/><line x1="28" y1="42" x2="68" y2="42" stroke-width="1.5"/><circle cx="28" cy="42" r="9" fill="none" stroke-width="1.5"/><circle cx="68" cy="42" r="9" fill="none" stroke-width="1.5"/>`;
  if (t.some((x) => ['energy', 'climate', 'infrastructure'].includes(x)))
    return `<path d="M48 18 L34 52 L45 52 L33 78 L64 44 L52 44 L66 18 Z" fill="none" stroke-width="2" stroke-linejoin="round"/>`;
  if (t.some((x) => ['labor', 'housing'].includes(x)))
    return `<path d="M22 60 L48 26 L74 60" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="34" y="60" width="28" height="18" fill="none" stroke-width="2"/><rect x="44" y="66" width="8" height="12" fill="none" stroke-width="1.5"/>`;
  if (t.some((x) => ['science'].includes(x)))
    return `<circle cx="48" cy="48" r="10" fill="none" stroke-width="2"/><ellipse cx="48" cy="48" rx="26" ry="10" fill="none" stroke-width="1.5"/><ellipse cx="48" cy="48" rx="26" ry="10" fill="none" stroke-width="1.5" transform="rotate(60 48 48)"/><ellipse cx="48" cy="48" rx="26" ry="10" fill="none" stroke-width="1.5" transform="rotate(120 48 48)"/>`;
  if (t.some((x) => ['education'].includes(x)))
    return `<path d="M22 46 L48 30 L74 46 L48 62 Z" fill="none" stroke-width="2" stroke-linejoin="round"/><line x1="66" y1="50" x2="66" y2="68" stroke-width="2" stroke-linecap="round"/><path d="M55 68 a12 6 0 0 1 22 0" fill="none" stroke-width="2"/>`;
  // Default: ocean wave (site brand motif)
  return `<path d="M14 52 Q26 38 38 52 Q50 66 62 52 Q74 38 86 52" fill="none" stroke-width="2.5" stroke-linecap="round"/><path d="M14 64 Q26 50 38 64 Q50 78 62 64 Q74 50 86 64" fill="none" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>`;
}

function renderStoryThumbFallback(className, topics) {
  const icon = getTopicSvgIcon(topics);
  return `<figure class="${className} story-thumb--fallback" aria-hidden="true"><svg viewBox="0 0 96 96" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">${icon}</svg></figure>`;
}

function renderStoryThumb(imageUrl, className, altText = '', topics = []) {
  if (imageUrl) {
    return `<figure class="${className}"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(altText)}" loading="lazy" decoding="async" onerror="this.parentElement.remove()"></figure>`;
  }
  return renderStoryThumbFallback(className, topics);
}

function renderStoryActions(story, baseClass = 'topic-story-link') {
  const slug = escapeHtml(story.slug || '');
  const hasSlug = Boolean(story.slug);
  const external = story.url ? `<a class="${baseClass} secondary" href="${escapeHtml(story.url)}" target="_blank" rel="noopener">Source</a>` : '';
  const open = hasSlug
    ? `<a class="${baseClass}" href="/story/${slug}" onclick="window.openStory('${slug}');return false;">Open</a>`
    : (story.url ? `<a class="${baseClass}" href="${escapeHtml(story.url)}" target="_blank" rel="noopener">Open</a>` : '');
  return { open, external };
}

function scoreLabel(score) {
  if (typeof score !== 'number') return '--';
  return Math.round(score * 100);
}

function isLegislativeStory(story) {
  const topics = story.topics || [];
  const text = `${story.headline || story.title || ''} ${story.dek || ''}`.toLowerCase();
  return Boolean(
    story.primaryDocs?.length
    || topics.some((topic) => ['law', 'uspolitics', 'elections', 'global_trade', 'defense'].includes(topic))
    || /\b(h\.r\.|s\.|h\.j\.res\.|s\.j\.res\.|bill|act|resolution|appropriation|congress)\b/i.test(text)
  );
}

function legislativeRank(story) {
  const docs = story.primaryDocs || [];
  const hasGovDoc = docs.some((doc) => /\.gov(\/|$)/i.test(doc.url || ''));
  const hasCongressDoc = docs.some((doc) => /congress\.gov/i.test(doc.url || ''));
  const updatedAt = new Date(story.updatedAt || story.publishedAt || 0).getTime();
  return (story.score || 0) * 1000
    + (hasGovDoc ? 90 : 0)
    + (hasCongressDoc ? 120 : 0)
    + Math.floor(updatedAt / 3600000);
}

function findGovernmentDoc(story) {
  return (story.primaryDocs || []).find((doc) => /congress\.gov|govinfo\.gov|federalregister\.gov|\.gov(\/|$)/i.test(doc.url || '')) || null;
}

function governmentDocLabel(doc) {
  const url = doc?.url || '';
  if (/congress\.gov/i.test(url)) return 'Congress.gov';
  if (/govinfo\.gov/i.test(url)) return 'GovInfo';
  if (/federalregister\.gov/i.test(url)) return 'Federal Register';
  if (/whitehouse\.gov/i.test(url)) return 'White House';
  if (/supremecourt\.gov/i.test(url)) return 'Supreme Court';
  if (/fema\.gov/i.test(url)) return 'FEMA';
  return doc?.label || 'Official document';
}

export function renderMetaRibbon(store) {
  const runTime = document.getElementById('runTime');
  const sourceCount = document.getElementById('sourceCount');
  const marketPulse = document.getElementById('marketPulse');
  const refreshLatency = document.getElementById('refreshLatency');
  if (!runTime || !sourceCount) return;

  const lastUpdated = store.lastUpdated ? new Date(store.lastUpdated) : null;
  runTime.textContent = lastUpdated ? `Run: ${lastUpdated.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : 'Run: --';
  sourceCount.textContent = `Sources: ${store.metrics?.sourcesChecked ?? '--'}`;
  if (marketPulse) {
    const intel = store.marketIntelligence;
    const pulse = intel?.pulse || store.marketPulse || 'Stable';
    const regime = intel?.regime ? ` · ${intel.regime}` : '';
    marketPulse.textContent = `Market Pulse: ${pulse}${regime}`;
    if (intel?.summary) marketPulse.title = intel.summary;
  }
  if (refreshLatency) refreshLatency.textContent = `Refresh: ${store.metrics?.durationMs ? Math.round(store.metrics.durationMs / 1000) + 's' : '--'}`;
}

export function renderTodayBrief(store) {
  const lead = document.getElementById('todayBriefLead');
  const list = document.getElementById('todayBriefList');
  if (!lead || !list) return;
  const hasStories = Boolean(store.stories?.length);
  lead.textContent = store.brief?.lead || (hasStories ? 'Summary unavailable for this run.' : 'No stories are currently loaded. Trigger refresh to ingest sources.');
  const bullets = store.brief?.bullets || [];
  list.innerHTML = bullets.length
    ? bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
    : `<li>${hasStories ? 'Story summaries are being synthesized for this run.' : 'No new items from sources in this run.'}</li>`;
}

export function renderHero(store) {
  const lead = store.stories?.[0] || store.daily?.[0];
  const headline = document.getElementById('heroHeadline');
  const subhead = document.getElementById('heroSubhead');
  const meta = document.getElementById('heroMeta');
  const citation = document.getElementById('heroCitation');
  if (!headline || !subhead || !meta || !citation) return;
  if (!lead) {
    headline.textContent = 'No verified stories available yet.';
    subhead.textContent = 'Run a refresh to ingest latest feeds and build the daily intelligence stack.';
    meta.textContent = 'Awaiting source ingestion';
    citation.innerHTML = '';
    return;
  }

  headline.innerHTML = escapeHtml(lead.headline || lead.title);
  subhead.textContent = lead.dek || lead.summary || 'Briefing update ready.';
  const refreshed = store.lastUpdated ? formatTime(store.lastUpdated) : '';
  meta.innerHTML = `<span style="display:inline-block;width:5px;height:5px;background:var(--accent-gold);border-radius:50%"></span><span>${formatDate(lead.updatedAt || lead.publishedAt)}</span><span style="color:var(--border-strong)">&middot;</span><span>Score ${scoreLabel(lead.score)}/100</span>${refreshed ? `<span style="color:var(--border-strong)">&middot;</span><span>Refreshed ${escapeHtml(refreshed)}</span>` : ''}`;
  citation.innerHTML = lead.url ? `<div class="citation-link"><a href="${escapeHtml(lead.url)}" target="_blank" rel="noopener">${escapeHtml(lead.url)}</a> <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 1h7v7M11 1L5 7"/></svg></div>` : '';
  if (lead.source) {
    citation.innerHTML += `<div class="citation-author">${escapeHtml(lead.source)}</div><div class="citation-date">${formatDate(lead.updatedAt || lead.publishedAt)}</div>`;
  }
  renderArticleJsonLd(lead);
}

export function renderTopStories(store) {
  const container = document.getElementById('topStories');
  if (!container) return;
  const top = store.stories?.slice(0, 3) || [];
  if (!top.length) {
    container.innerHTML = '<div class=\"story-card\">No Top 3 stories yet. Refresh to populate prioritized intelligence.</div>';
    return;
  }
  container.innerHTML = top.map((story, index) => {
    const score = scoreLabel(story.score);
    const thumb = story.imageUrl
      ? `<figure class="top3-thumb"><img src="${escapeHtml(story.imageUrl)}" alt="" loading="lazy" decoding="async" onerror="this.parentElement.remove()"></figure>`
      : renderStoryThumbFallback('top3-thumb', story.topics);
    return `<div class="top3-card depth-tilt reveal ${index ? 'stagger-' + index : ''}">
      ${thumb}
      <span class="top3-rank">${String(index + 1).padStart(2, '0')}</span>
      <div class="top3-lock locked">&#x1F512; Locked</div>
      <div class="top3-category">${escapeHtml(story.topics?.[0] || 'Priority')}</div>
      <h3 class="top3-title"><a href="/story/${escapeHtml(story.slug)}">${escapeHtml(story.headline)}</a></h3>
      <p class="top3-excerpt">${escapeHtml(story.dek || '')}</p>
      <div class="top3-score"><div class="top3-score-bar"><div class="top3-score-fill" style="width:${score}%"></div></div><span class="top3-score-val">${score}</span></div>
      ${story.url ? `<a class="story-external-link" href="${escapeHtml(story.url)}" target="_blank" rel="noopener">Source Link</a>` : ''}
      <div class="citation"><div class="citation-author">${escapeHtml(story.sources?.[0]?.name || '')}</div><div class="citation-date">${formatDate(story.updatedAt)}</div></div>
    </div>`;
  }).join('');
}

export function renderDeveloping(store) {
  const container = document.getElementById('developingList');
  if (!container) return;
  const items = (store.stories || []).filter((story) => story.developing).slice(0, 6);
  if (!items.length) {
    container.innerHTML = '<div class=\"story-card\">No developing clusters are active right now.</div>';
    return;
  }
  container.innerHTML = items.map((story) => {
    return `<div class="developing-card depth-tilt">
      <div class="developing-meta">${escapeHtml(story.verificationTier)} &middot; ${story.sources?.length || 0} sources</div>
      <div class="developing-title"><a href="/story/${escapeHtml(story.slug)}">${escapeHtml(story.headline)}</a></div>
      <div class="story-card-excerpt">${escapeHtml(story.dek || '')}</div>
      <div class="developing-actions">
        ${(story.topics || []).slice(0, 3).map((topic) => `<span class="developing-chip">${escapeHtml(topic)}</span>`).join('')}
        ${story.url ? `<a class="story-external-link" href="${escapeHtml(story.url)}" target="_blank" rel="noopener">External</a>` : ''}
      </div>
    </div>`;
  }).join('');
}

export function renderTopicBlocks(store) {
  const container = document.getElementById('topicBlocks');
  if (!container) return;
  const blocks = store.topicBlocks || [];
  if (!blocks.length) {
    container.innerHTML = '<div class=\"story-card\">Topic blocks will appear after the next successful ingest run.</div>';
    return;
  }
  container.innerHTML = blocks.map((block) => {
    return `<div class="topic-block-card depth-tilt">
      <div class="topic-block-title">${escapeHtml(block.label)}</div>
      <ul class="topic-block-list">
        ${block.items.map((item) => `<li class="topic-block-item"><a href="/story/${escapeHtml(item.slug)}">${escapeHtml(item.headline)}</a></li>`).join('')}
      </ul>
    </div>`;
  }).join('');
}

export function renderDailyInsight(store) {
  const text = document.getElementById('dailyInsightText');
  const source = document.getElementById('dailyInsightSource');
  if (!text || !source) return;
  text.textContent = store.quotes?.dailyInsight || 'Signal will appear after refresh.';
  source.textContent = `Source: ${store.quotes?.source || 'Original'}`;
}

export function renderDailyFeed(store, saved = new Set(), followed = new Set(), lastVisitAt = null) {
  const list = document.getElementById('storyList');
  if (!list) return;
  const debug = new URLSearchParams(window.location.search).get('debug') === '1';
  const rawItems = store.stories || [];
  if (!rawItems.length) {
    list.innerHTML = '<article class=\"story-card\"><h3 class=\"story-card-title\">No stories ingested in this run</h3><p class=\"story-card-excerpt\">No new items from sources in this run. Try refresh again or review Archive for prior coverage.</p></article>';
    return { newCount: 0 };
  }

  // Cap feed: take up to FEED_MAX_PER_TIER from each tier, then fill remaining
  // slots from whichever tiers have surplus (highest-score first).
  const byTier = { 1: [], 2: [], 3: [] };
  for (const s of rawItems) {
    const t = s.tier in byTier ? s.tier : 3;
    byTier[t].push(s);
  }
  const selected = [
    ...byTier[1].slice(0, FEED_MAX_PER_TIER),
    ...byTier[2].slice(0, FEED_MAX_PER_TIER),
    ...byTier[3].slice(0, FEED_MAX_PER_TIER),
  ];
  if (selected.length < FEED_MAX_STORIES) {
    const surplus = [
      ...byTier[1].slice(FEED_MAX_PER_TIER),
      ...byTier[2].slice(FEED_MAX_PER_TIER),
      ...byTier[3].slice(FEED_MAX_PER_TIER),
    ].sort((a, b) => (b.score || 0) - (a.score || 0));
    selected.push(...surplus.slice(0, FEED_MAX_STORIES - selected.length));
  }
  // Re-sort final selection by score descending so highest-impact leads
  const items = selected.sort((a, b) => (b.score || 0) - (a.score || 0));

  const lastVisit = lastVisitAt ? new Date(lastVisitAt) : null;
  let newCount = 0;

  // Build the HTML string for a single story card (extracted for reconciliation)
  function buildCardHtml(story) {
    const score = scoreLabel(story.score);
    const breakdown = debug && story.scoreBreakdown ? `Score: ${score} | tier ${story.scoreBreakdown.tierWeight.toFixed(2)} recency ${story.scoreBreakdown.recency.toFixed(2)}` : '';
    const topicsStr = (story.topics || []).join(',');
    const isNew = lastVisit && new Date(story.publishedAt) > lastVisit;
    const newBadge = isNew ? `<span class="story-new-badge" title="New since your last visit">NEW</span>` : '';

    const wordCount = ((story.headline || '') + ' ' + (story.dek || '') + ' ' + (story.summary || '')).split(/\s+/).filter(Boolean).length;
    const readTime = `${Math.max(1, Math.round(wordCount / 200))} min read`;

    const thumbHtml = story.imageUrl
      ? `<figure class="story-card-thumb"><img src="${escapeHtml(story.imageUrl)}" alt="" loading="lazy" decoding="async" onerror="this.parentElement.remove()"></figure>`
      : renderStoryThumbFallback('story-card-thumb', story.topics);

    const entityTags = [
      ...(story.entities?.tickers || []).map((t) => `<span class="entity-tag entity-ticker">${escapeHtml(t)}</span>`),
      ...(story.entities?.countries || []).slice(0, 2).map((c) => `<span class="entity-tag entity-country">${escapeHtml(c)}</span>`)
    ].join('');

    return `<article class="story-card depth-tilt reveal${isNew ? ' story-card--new' : ''} story-card--has-thumb" data-tier="${story.tier}" data-date="${story.updatedAt}" data-story-id="${escapeHtml(story.id)}" data-topic="${escapeHtml(story.topics?.[0] || '')}" data-topics="${escapeHtml(topicsStr)}">
      ${thumbHtml}
      <div class="story-card-header">
        ${newBadge}
        <span class="story-card-tier tier-${story.tier}">Tier ${story.tier}</span>
        <span class="story-card-score">${score}</span>
      </div>
      <h3 class="story-card-title"><a href="/story/${escapeHtml(story.slug)}" onclick="window.openStory('${escapeHtml(story.slug)}');return false;">${escapeHtml(story.headline)}</a></h3>
      <p class="story-card-excerpt">${escapeHtml(story.dek || '')}</p>
      ${entityTags ? `<div class="entity-tags">${entityTags}</div>` : ''}
      <div class="spectrum-mini">${(story.spectrum || []).map((row) => `<span style=\"width:${Number(row.percent)||0}%;background:${escapeHtml(row.color||'')}\"></span>`).join('')}</div>
      <div class="story-card-footer">
        <span class="story-card-source"><span class="source-dot center"></span> ${escapeHtml(story.sources?.[0]?.name || '')}</span>
        <span>&middot;</span>
        <span class="story-card-source">${formatDate(story.updatedAt)}</span>
        <span>&middot;</span><span class="story-read-time">${readTime}</span>
        ${story.url ? `<span>&middot;</span><a class="story-external-link" href="${escapeHtml(story.url)}" target="_blank" rel="noopener">Original</a>` : ''}
      </div>
      <div class="story-actions">
        <button class="story-btn ${saved.has(story.id) ? 'active' : ''}" data-save="${escapeHtml(story.id)}">${saved.has(story.id) ? 'Saved' : 'Save'}</button>
        <button class="story-btn ${followed.has(story.topics?.[0]) ? 'active' : ''}" data-follow="${escapeHtml(story.topics?.[0] || '')}">${followed.has(story.topics?.[0]) ? 'Following' : 'Follow Topic'}</button>
        <button class="story-btn" data-share-story="${escapeHtml(story.slug)}" data-share-title="${escapeHtml(story.headline)}" title="Copy link">Share</button>
        <span class="story-card-score">${escapeHtml(story.verificationTier)}</span>
      </div>
      <div class="citation"><div class="citation-author">${escapeHtml(story.sources?.[0]?.name || '')}</div><div class="citation-date">${formatDate(story.updatedAt)}${breakdown ? ` &middot; ${escapeHtml(breakdown)}` : ''}</div></div>
    </article>`;
  }

  // Count new stories across all items (before DOM work)
  for (const story of items) {
    if (lastVisit && new Date(story.publishedAt) > lastVisit) newCount += 1;
  }

  // Key-based DOM reconciliation: reuse existing card nodes, only insert/remove diffs.
  // This preserves scroll position, CSS animation state, and avoids full repaint.
  if (list.children.length > 0) {
    const existingMap = new Map();
    for (const el of [...list.querySelectorAll('article[data-story-id]')]) {
      existingMap.set(el.dataset.storyId, el);
    }
    const newIds = new Set(items.map((s) => s.id));

    let refNode = list.firstChild;
    for (const story of items) {
      const existing = existingMap.get(story.id);
      if (existing) {
        if (existing !== refNode) list.insertBefore(existing, refNode || null);
        refNode = existing.nextSibling;
      } else {
        const tpl = document.createElement('template');
        tpl.innerHTML = buildCardHtml(story);
        const newEl = tpl.content.firstElementChild;
        list.insertBefore(newEl, refNode || null);
        refNode = newEl?.nextSibling ?? null;
      }
    }
    // Remove cards no longer in the feed
    for (const [id, el] of existingMap) {
      if (!newIds.has(id)) el.remove();
    }
  } else {
    // Initial render: fast full innerHTML set
    list.innerHTML = items.map(buildCardHtml).join('');
  }

  return { newCount };
}

/**
 * Render a "since last visit" notification banner above the feed.
 */
export function renderSinceLastVisit(newCount, lastVisitAt) {
  const banner = document.getElementById('sinceLastVisit');
  if (!banner) return;
  if (!lastVisitAt || newCount === 0) {
    banner.style.display = 'none';
    return;
  }
  const timeAgo = formatTimeAgo(new Date(lastVisitAt));
  banner.style.display = '';
  banner.innerHTML = `<span class="since-visit-icon">&#9679;</span> <strong>${newCount} new story${newCount === 1 ? '' : 's'}</strong> since your last visit ${timeAgo}`;
}

function formatTimeAgo(date) {
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

/**
 * Render the AI-generated market intelligence card.
 * Visualises pulse, regime, summary, and signals as a styled panel with SVG accent.
 */
function signalSparkline(signals, regime) {
  if (!signals || !signals.length) return '';
  const regimeStrokeColors = {
    'risk-on':  '#27ae60', 'risk-off': '#c0392b',
    'volatile': '#f39c12', 'stable':   '#2980b9',
  };
  const color = regimeStrokeColors[(regime || 'stable').toLowerCase()] || '#2980b9';
  const pts = signals.slice(0, 6).map((s, i) => {
    const v = s.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const y = 28 - ((v % 40) - 20) * 0.6;
    return { x: i * 16, y: Math.max(4, Math.min(36, y)) };
  });
  if (pts.length < 2) return '';
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${lineD} L${pts[pts.length-1].x},40 L0,40 Z`;
  const gradId = `sg-${Math.random().toString(36).slice(2,7)}`;
  return `<svg viewBox="0 0 ${pts[pts.length-1].x + 4} 40" class="market-sparkline" style="color:${color}" aria-hidden="true">
    <defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${areaD}" fill="url(#${gradId})"/>
    <path d="${lineD}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function renderMarketIntel(store) {
  const container = document.getElementById('marketIntelCard');
  if (!container) return;
  const intel = store.marketIntelligence;
  if (!intel) { container.style.display = 'none'; return; }
  container.style.display = '';

  const pulseColors = { Volatile: '#d96060', Active: '#c9a24a', Stable: '#3dab78', Subdued: '#7a96a8' };
  const regimeColors = { 'risk-on': '#3dab78', 'risk-off': '#d96060', volatile: '#c9a24a', stable: '#7a96a8' };
  const regimeBgColors = {
    'risk-on':  'rgba(39,174,96,0.08)',
    'risk-off': 'rgba(192,57,43,0.08)',
    'volatile': 'rgba(243,156,18,0.08)',
    'stable':   'rgba(41,128,185,0.06)',
  };
  const pColor = pulseColors[intel.pulse] || '#7a96a8';
  const rColor = regimeColors[intel.regime] || '#7a96a8';
  const regime = (intel.regime || 'stable').toLowerCase();
  const tileBackground = regimeBgColors[regime] || regimeBgColors['stable'];

  const signals = (intel.signals || []).slice(0, 6);
  const sparkline = signalSparkline(signals, intel.regime);
  const signalLabel = signals[0] ? escapeHtml(signals[0].split(' ').slice(0, 3).join(' ')) : '';

  const signalItems = signals.slice(0, 3).map((s) =>
    `<li class="market-signal-item"><span class="market-signal-dot" style="background:${pColor}"></span>${escapeHtml(s)}</li>`
  ).join('');

  container.innerHTML = `
    <div class="market-intel-card" style="background:${tileBackground}">
      <div class="market-intel-header">
        <span class="market-intel-pulse" style="background:${pColor}20;color:${pColor};border-color:${pColor}40">${escapeHtml(intel.pulse)}</span>
        <span class="market-intel-regime" style="color:${rColor};font-family:var(--font-mono);font-size:var(--text-xl);font-weight:700">${escapeHtml(intel.regime)}</span>
        <span class="market-intel-label">AI Market Read</span>
      </div>
      ${signalLabel ? `<div style="font-family:var(--font-mono);font-size:var(--text-2xs);color:var(--text-muted);letter-spacing:0.08em;margin-bottom:4px">${signalLabel}</div>` : ''}
      ${sparkline}
      <p class="market-intel-summary">${escapeHtml(intel.summary || '')}</p>
      ${signalItems ? `<ul class="market-signal-list">${signalItems}</ul>` : ''}
    </div>`;

  // Also apply regime color to static market tiles
  document.querySelectorAll('.market-tile').forEach((tile) => {
    tile.style.background = tileBackground;
  });
}

export function renderMarketHeatmap(stories, container) {
  if (!container) return;
  const sectors = [
    { id: 'economy',     label: 'Economy',    color: 'rgba(41,128,185,' },
    { id: 'finance',     label: 'Finance',    color: 'rgba(39,174,96,' },
    { id: 'tech',        label: 'Tech',       color: 'rgba(155,89,182,' },
    { id: 'defense',     label: 'Defense',    color: 'rgba(192,57,43,' },
    { id: 'global_trade',label: 'Trade',      color: 'rgba(243,156,18,' },
    { id: 'uspolitics',  label: 'Policy',     color: 'rgba(180,138,58,' },
  ];
  const degrees = {};
  (stories || []).forEach((s) => (s.topics || []).forEach((t) => { degrees[t] = (degrees[t] || 0) + 1; }));
  const maxDeg = Math.max(1, ...Object.values(degrees));
  container.innerHTML = `
    <div class="market-heatmap">
      ${sectors.map((sec) => {
        const count = degrees[sec.id] || 0;
        const opacity = Math.min(0.75, 0.05 + (count / maxDeg) * 0.70);
        return `<div class="heatmap-tile" style="background:${sec.color}${opacity})">
          <div class="heatmap-tile-label">${escapeHtml(sec.label)}</div>
          <div class="heatmap-tile-count">${count}</div>
          <div class="heatmap-tile-sub">stor${count !== 1 ? 'ies' : 'y'}</div>
        </div>`;
      }).join('')}
    </div>`;
}

/**
 * Render political cartoons and illustrated commentary in a horizontal strip.
 * Shows stories with contentType==='cartoon' or that have imageUrl set from cartoon sources.
 */
export function renderCartoons(store) {
  const container = document.getElementById('cartoonsStrip');
  const rail = document.getElementById('cartoonsRail');
  if (!container && !rail) return;
  const items = (store.stories || [])
    .filter((s) => s.contentType === 'cartoon' || (s.imageUrl && s.sources?.some((src) => /xkcd|nib|cagle|gocomics/i.test(src.name || ''))))
    .slice(0, 8);
  if (!items.length) {
    if (container?.closest('.tier-section')?.style) container.closest('.tier-section').style.display = 'none';
    if (rail?.closest('.sidebar-card')?.style) rail.closest('.sidebar-card').style.display = 'none';
    return;
  }

  if (container?.closest('.tier-section')) container.closest('.tier-section').style.display = '';
  if (rail?.closest('.sidebar-card')) rail.closest('.sidebar-card').style.display = '';

  const cards = items.map((story) => {
    const thumb = story.imageUrl
      ? `<figure class="cartoon-thumb"><img src="${escapeHtml(story.imageUrl)}" alt="${escapeHtml(story.headline)}" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'"></figure>`
      : `<div class="cartoon-thumb cartoon-thumb--placeholder"><svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="24" cy="24" r="20"/><path d="M16 20c2-3 8-5 10 0s7 6 8 2"/><circle cx="18" cy="22" r="2" fill="currentColor"/><circle cx="30" cy="22" r="2" fill="currentColor"/><path d="M18 31c2 3 10 3 12 0"/></svg></div>`;
    return `<div class="cartoon-card depth-tilt">
      ${thumb}
      <div class="cartoon-meta">
        <div class="cartoon-source">${escapeHtml(story.sources?.[0]?.name || '')}</div>
        <a class="cartoon-title" href="${escapeHtml(story.url || '#')}" target="_blank" rel="noopener">${escapeHtml(story.headline)}</a>
      </div>
    </div>`;
  }).join('');

  if (container) container.innerHTML = cards;
  if (rail) rail.innerHTML = items.slice(0, 3).map((story) => {
    const thumb = story.imageUrl
      ? `<figure class="cartoon-thumb"><img src="${escapeHtml(story.imageUrl)}" alt="${escapeHtml(story.headline)}" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'"></figure>`
      : `<div class="cartoon-thumb cartoon-thumb--placeholder"><svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="24" cy="24" r="20"/><path d="M16 20c2-3 8-5 10 0s7 6 8 2"/><circle cx="18" cy="22" r="2" fill="currentColor"/><circle cx="30" cy="22" r="2" fill="currentColor"/><path d="M18 31c2 3 10 3 12 0"/></svg></div>`;
    return `<div class="cartoon-card cartoon-card--rail">
      ${thumb}
      <div class="cartoon-meta">
        <div class="cartoon-source">${escapeHtml(story.sources?.[0]?.name || '')}</div>
        <a class="cartoon-title" href="${escapeHtml(story.url || '#')}" target="_blank" rel="noopener">${escapeHtml(story.headline)}</a>
      </div>
    </div>`;
  }).join('');
}

export function renderHighImportance(store) {
  const list = document.getElementById('highImportanceList');
  const section = document.getElementById('legisSection');
  if (!list) return;
  const pool = [...(store.highImportance || []), ...(store.stories || [])];
  const seen = new Set();
  const items = pool
    .filter((story) => story?.id && !seen.has(story.id) && isLegislativeStory(story) && findGovernmentDoc(story) && seen.add(story.id))
    .sort((a, b) => legislativeRank(b) - legislativeRank(a))
    .slice(0, 8);

  if (!items.length) {
    if (section) section.style.display = 'none';
    return;
  }
  if (section) section.style.display = '';

  list.innerHTML = items.map((story) => {
    const primary = findGovernmentDoc(story);
    const bill = primary?.title?.match(/\b(H\.R\.|S\.|H\.J\.Res\.|S\.J\.Res\.)\s?\d+\b/i)?.[0]
      || (story.headline || story.title || '').match(/\b(H\.R\.|S\.|H\.J\.Res\.|S\.J\.Res\.)\s?\d+\b/i)?.[0]
      || story.topics?.[0]
      || 'Priority';
    const storyUrl = story.slug
      ? `/story/${escapeHtml(story.slug)}`
      : (story.url ? escapeHtml(story.url) : '');
    const storyAction = storyUrl
      ? (story.slug
        ? `<a class="legis-card-action legis-card-action--secondary" href="${storyUrl}" onclick="window.openStory('${escapeHtml(story.slug)}');return false;">Coverage</a>`
        : `<a class="legis-card-action legis-card-action--secondary" href="${storyUrl}" target="_blank" rel="noopener">Coverage</a>`)
      : '';
    const docAction = primary?.url
      ? `<a class="legis-card-action" href="${escapeHtml(primary.url)}" target="_blank" rel="noopener">${escapeHtml(governmentDocLabel(primary))}</a>`
      : '';
    const sourceName = primary?.label || story.sources?.[0]?.name || story.source || '';
    const updated = formatDate(story.updatedAt || story.publishedAt);
    const topic = (story.topics?.[0] || 'legislation').replace(/_/g, ' ');
    const score = scoreLabel(story.score);
    return `<div class="legis-card">
      <div class="legis-card-top">
        <span class="legis-card-bill-num">${escapeHtml(String(bill).replace(/_/g, ' '))}</span>
        <span class="legis-card-score-badge">${score}</span>
      </div>
      <h3 class="legis-card-title">${escapeHtml(story.headline || story.title)}</h3>
      ${story.dek ? `<p class="legis-card-dek">${escapeHtml(story.dek)}</p>` : ''}
      <div class="legis-card-meta">
        ${sourceName ? `<span class="legis-card-source">${escapeHtml(sourceName)}</span><span class="legis-card-dot">&middot;</span>` : ''}
        <span class="legis-card-date">${escapeHtml(updated)}</span>
        <span class="legis-card-dot">&middot;</span>
        <span class="legis-card-topic">${escapeHtml(topic)}</span>
      </div>
      <div class="legis-card-actions">${docAction}${storyAction}</div>
    </div>`;
  }).join('');
}

export function renderArchive(store) {
  const container = document.getElementById('archiveContent');
  if (!container) return;
  const weeks = store.weeklyDigests || [];
  if (!weeks.length) {
    container.innerHTML = '<div class=\"story-card\">Archive will populate after at least one successful refresh.</div>';
    return;
  }
  container.innerHTML = weeks.map((week) => {
    const items = week.top.map((story) => {
      return `<div class="archive-day"><div class="archive-day-header"><span class="archive-day-date">${escapeHtml(week.label)}</span><div class="archive-day-runs"><span class="archive-run-badge active">AM</span></div></div><div class="archive-briefing-card"><div><div class="archive-lead">${escapeHtml(story.headline || story.title)}</div><div class="archive-meta">${week.count} stories &middot; Score ${scoreLabel(story.score)}</div></div><div class="archive-dominant">${escapeHtml(story.topics?.[0] || 'Priority')}</div></div></div>`;
    }).join('');
    return `<div class="archive-week" data-week="${escapeHtml(week.key)}" data-start="${escapeHtml(week.range?.start || '')}" data-end="${escapeHtml(week.range?.end || '')}"><div class="archive-week-header" data-toggle-week><span class="archive-week-title">${escapeHtml(week.key)}</span><span class="archive-week-toggle">&#9662;</span></div><div class="archive-week-body">${items}</div></div>`;
  }).join('');
}

export function renderTopics(store) {
  const container = document.getElementById('topicsContent');
  if (!container) return;
  const topics = store.topics || [];
  if (!topics.length) {
    container.innerHTML = '<div class=\"story-card\">No topic clusters available yet. Refresh to generate category views.</div>';
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  container.innerHTML = topics.map((topic) => {
    const todayCount = topic.items.filter((story) => String(story.updatedAt || story.publishedAt || '').slice(0, 10) === today).length;
    const range = topic.range?.start && topic.range?.end
      ? ` · ${escapeHtml(formatDate(topic.range.start))} to ${escapeHtml(formatDate(topic.range.end))}`
      : '';
    const clusterIntro = (topic.items[0]?.whyItMatters || topic.items[0]?.whatsNext)
      ? `<div class="topic-cluster-intro">
          ${topic.items[0].whyItMatters ? `<p class="topic-cluster-lead">${escapeHtml(topic.items[0].whyItMatters)}</p>` : ''}
          ${topic.items[0].whatsNext ? `<p class="topic-cluster-watch"><strong>Watch for:</strong> ${escapeHtml(topic.items[0].whatsNext)}</p>` : ''}
          <span class="topic-story-count">${topic.items.length} stor${topic.items.length !== 1 ? 'ies' : 'y'}</span>
        </div>`
      : '';
    const groups = groupStoriesByDate(topic.items).map((group, gi) => {
      const items = group.items.map((story) => {
        const storyDate = String(story.updatedAt || story.publishedAt || '').slice(0, 10);
        const storyTime = formatTime(story.updatedAt || story.publishedAt);
        const slug = escapeHtml(story.slug || '');
        const hasSlug = Boolean(story.slug);
        const { open, external } = renderStoryActions(story);
        const thumb = renderStoryThumb(story.imageUrl, 'topic-story-thumb', story.headline || story.title || '', story.topics);
        return `<article class="topic-story topic-story--has-thumb" data-story-date="${escapeHtml(storyDate)}">
          <span class="topic-story-score">${scoreLabel(story.score)}</span>
          ${thumb}
          <div class="topic-story-main">
            <div class="topic-story-title">${hasSlug ? `<a href="/story/${slug}" onclick="window.openStory('${slug}');return false;">${escapeHtml(story.headline || story.title)}</a>` : escapeHtml(story.headline || story.title)}</div>
            <div class="topic-story-excerpt">${escapeHtml(story.dek || story.summary || '')}</div>
            <div class="topic-story-info">${escapeHtml(story.sources?.[0]?.name || story.source || '')}${storyDate ? ` &middot; ${escapeHtml(formatDate(story.updatedAt || story.publishedAt))}` : ''}</div>
          </div>
          <div class="topic-story-side">
            <span class="topic-story-date">${escapeHtml(storyTime || group.label)}</span>
            <div class="topic-story-actions">${open}${external}</div>
          </div>
        </article>`;
      }).join('');
      return `<section class="topic-date-group${gi > 0 ? ' collapsed' : ''}" data-topic-date="${escapeHtml(group.date)}"><div class="topic-date-group-header" data-toggle-topic-group><span class="topic-date-group-title">${escapeHtml(group.label)}</span><span class="topic-date-group-meta">${group.items.length} stor${group.items.length === 1 ? 'y' : 'ies'}</span><span class="topic-date-group-toggle" aria-hidden="true">&#9662;</span></div>${items}</section>`;
    }).join('');
    return `<div class="topic-section" data-topic-section="${escapeHtml(topic.topic)}"><div class="topic-section-header"><h2 class="topic-section-title">${escapeHtml(topic.label || topic.topic)}</h2><span class="topic-section-meta">${topic.count} stories${todayCount ? ` · ${todayCount} today` : ''}${range}</span></div>${clusterIntro}${groups}</div>`;
  }).join('');
}

export function renderResources(resources) {
  const container = document.getElementById('resourcesContent');
  if (!container) return;
  container.innerHTML = resources.map((item) => `<article class="about-body">${item.html}</article>`).join('');
}

export function renderWeeklyDigest(store) {
  const container = document.getElementById('weeklyDigest');
  if (!container) return;
  const digest = store.digest;
  if (!digest) return;
  container.innerHTML = `<div class="archive-week">
    <div class="archive-week-header"><span class="archive-week-title">${escapeHtml(digest.label || 'Latest Digest')}</span><span class="archive-week-toggle">&#9662;</span></div>
    <div class="archive-week-body">
      <div class="archive-briefing-card"><div><div class="archive-lead">Executive Summary</div><div class="archive-meta">${escapeHtml(digest.summary)}</div></div><div class="archive-dominant">Digest</div></div>
      <div class="archive-briefing-card"><div><div class="archive-lead">Top 10</div><div class="archive-meta">${digest.top10.length} stories</div></div><div class="archive-dominant">Highlights</div></div>
      ${digest.top10.map((story) => `<div class="archive-briefing-card"><div><div class="archive-lead">${escapeHtml(story.headline)}</div><div class="archive-meta">${escapeHtml(story.sources?.[0]?.name || '')} &middot; Score ${scoreLabel(story.score)}</div></div><div class="archive-dominant">${escapeHtml(story.topics?.[0] || 'Priority')}</div></div>`).join('')}
      <div class="archive-briefing-card"><div><div class="archive-lead">Market Recap</div><div class="archive-meta">${digest.marketRecap.length} stories</div></div><div class="archive-dominant">Markets</div></div>
      ${digest.marketRecap.map((story) => `<div class="archive-briefing-card"><div><div class="archive-lead">${escapeHtml(story.headline)}</div><div class="archive-meta">${escapeHtml(story.sources?.[0]?.name || '')}</div></div><div class="archive-dominant">Markets</div></div>`).join('')}
      <div class="archive-briefing-card"><div><div class="archive-lead">Policy Recap</div><div class="archive-meta">${digest.policyRecap.length} stories</div></div><div class="archive-dominant">Policy</div></div>
      ${digest.policyRecap.map((story) => `<div class="archive-briefing-card"><div><div class="archive-lead">${escapeHtml(story.headline)}</div><div class="archive-meta">${escapeHtml(story.sources?.[0]?.name || '')}</div></div><div class="archive-dominant">Policy</div></div>`).join('')}
    </div>
  </div>`;
}

export function renderDigestPage(digest) {
  const title = document.getElementById('digestTitle');
  const intro = document.getElementById('digestIntro');
  const container = document.getElementById('digestPageContent');
  if (!container || !digest) return;
  if (title) title.textContent = digest.label || 'Weekly Intelligence Digest';
  if (intro) intro.textContent = digest.summary || 'Executive summary and highlights.';

  const leadStory = digest.top10?.[0];
  const supportStories = (digest.top10 || []).slice(1, 5);
  const remainingStories = (digest.top10 || []).slice(5);

  const editorialGrid = leadStory ? `<div class="digest-editorial-grid">
    <div class="digest-lead-story">
      <div class="digest-lead-headline">${escapeHtml(leadStory.headline || '')}</div>
      <div class="digest-lead-why">${escapeHtml(leadStory.whyItMatters || leadStory.dek || leadStory.summary || '')}</div>
      <div class="story-card-meta">${escapeHtml(leadStory.sources?.[0]?.name || '')} &middot; Score ${scoreLabel(leadStory.score)}</div>
    </div>
    <div class="digest-support-stories">
      ${supportStories.map((s) => `<div class="digest-support-item">
        <div class="digest-support-headline">${escapeHtml(s.headline || '')}</div>
        <div class="digest-support-meta">${escapeHtml(s.sources?.[0]?.name || '')} &middot; ${escapeHtml(s.topics?.[0] || '')}</div>
      </div>`).join('')}
    </div>
  </div>` : '';

  const recapRows = [...(digest.marketRecap || []).map((s) => ({ ...s, rowClass: 'economy-row' })), ...(digest.policyRecap || []).map((s) => ({ ...s, rowClass: 'policy-row' }))];
  const recapSection = recapRows.length ? `<div class="digest-recap-section">
    <div class="digest-recap-title">Sector Recap</div>
    <table class="digest-recap-table"><tbody>
      ${recapRows.map((s) => `<tr class="digest-recap-row ${s.rowClass}">
        <td class="digest-recap-headline">${escapeHtml(s.headline || '')}</td>
        <td class="digest-recap-source">${escapeHtml(s.sources?.[0]?.name || '')}</td>
      </tr>`).join('')}
    </tbody></table>
  </div>` : '';

  const remainingHtml = remainingStories.length ? `<div class="archive-week"><div class="archive-week-header"><span class="archive-week-title">More Highlights</span></div><div class="archive-week-body">${remainingStories.map((story) => `<div class="archive-briefing-card"><div><div class="archive-lead">${escapeHtml(story.headline)}</div><div class="archive-meta">${escapeHtml(story.sources?.[0]?.name || '')} &middot; Score ${scoreLabel(story.score)}</div></div><div class="archive-dominant">${escapeHtml(story.topics?.[0] || '')}</div></div>`).join('')}</div></div>` : '';

  container.innerHTML = editorialGrid + recapSection + remainingHtml;
}

export function renderOps(store) {
  const container = document.getElementById('opsMetrics');
  if (!container) return;
  const metrics = store.metrics || {};
  const health = store.sourceHealth?.summary || {};
  const intel = store.marketIntelligence;
  const items = [
    { label: 'Sources Checked', value: metrics.sourcesChecked ?? '--' },
    { label: 'Requests Used', value: metrics.requests ?? '--' },
    { label: 'Stories Published', value: store.stories?.length ?? '--' },
    { label: 'Clusters', value: metrics.clustersCreated ?? '--' },
    { label: 'Run Duration', value: metrics.durationMs ? Math.round(metrics.durationMs / 1000) + 's' : '--' },
    { label: 'High Importance', value: store.highImportance?.length ?? '--' },
    { label: 'Sources Healthy', value: health.healthy != null ? `${health.healthy}/${health.total}` : '--' },
    { label: 'Refresh Outcome', value: store.refreshOutcome || '--' },
    { label: 'Market Regime', value: intel?.regime || store.marketPulse || '--' }
  ];
  const signalsHtml = intel?.signals?.length
    ? `<div class="ops-card ops-card--wide"><h4>Market Signals</h4><ul style="margin:0;padding-left:1rem">${intel.signals.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul></div>`
    : '';
  container.innerHTML = items.map((item) => `<div class="ops-card"><h4>${escapeHtml(item.label)}</h4><p>${escapeHtml(String(item.value))}</p></div>`).join('') + signalsHtml;
}

const HEALTH_LABEL = { healthy: '●', degraded: '◐', unstable: '◯', paused: '○', unknown: '·' };
const HEALTH_COLOR = { healthy: 'var(--accent-teal)', degraded: 'var(--accent-gold)', unstable: 'var(--accent-red)', paused: 'var(--text-muted)', unknown: 'var(--border-default)' };
const ORIENT_LABEL = { center: 'C', 'center-left': 'CL', 'center-right': 'CR', left: 'L', right: 'R' };

export function renderSourceManager(data = {}) {
  const container = document.getElementById('sourceManagerList');
  const statsEl = document.getElementById('sourceManagerStats');
  if (!container) return;
  const { sources = [], stats = {} } = data;
  if (statsEl) statsEl.textContent = `${stats.active ?? 0} active / ${stats.total ?? 0} total`;

  const byTier = { 1: [], 2: [], 3: [] };
  for (const s of sources) byTier[s.tier]?.push(s);

  const tierLabels = { 1: 'Tier 1 — Primary', 2: 'Tier 2 — Secondary', 3: 'Tier 3 — Supplemental' };
  container.innerHTML = [1, 2, 3].map((tier) => {
    if (!byTier[tier].length) return '';
    const rows = byTier[tier].map((s) => {
      const health = s.health || 'unknown';
      const orient = ORIENT_LABEL[s.orientation] || s.orientation || '';
      const topics = (s.topics || []).slice(0, 3).join(', ');
      return `<div class="sm-row${s.enabled ? '' : ' sm-row--disabled'}" data-source-id="${escapeHtml(s.id)}">
        <span class="sm-health" style="color:${HEALTH_COLOR[health]}" title="${health}">${HEALTH_LABEL[health]}</span>
        <span class="sm-orient">${escapeHtml(orient)}</span>
        <span class="sm-name">${escapeHtml(s.name)}</span>
        <span class="sm-topics">${escapeHtml(topics)}</span>
        <span class="sm-actions">
          <button class="sm-btn sm-toggle${s.enabled ? ' active' : ''}" data-toggle="${escapeHtml(s.id)}" title="${s.enabled ? 'Disable' : 'Enable'}">${s.enabled ? 'ON' : 'OFF'}</button>
          <button class="sm-btn sm-remove" data-remove="${escapeHtml(s.id)}" title="Remove source">&#10005;</button>
        </span>
      </div>`;
    }).join('');
    return `<div class="sm-tier"><div class="sm-tier-label">${tierLabels[tier]} <span class="sm-tier-count">${byTier[tier].length}</span></div>${rows}</div>`;
  }).join('');
}

export function renderGlobalSearchResults(results = [], meta = {}) {
  const container = document.getElementById('globalSearchResults');
  const count = document.getElementById('globalSearchCount');
  if (!container) return;
  if (count) {
    const archiveNote = meta.fromArchive ? ' <span class="search-archive-note">(incl. archive)</span>' : '';
    count.innerHTML = `${results.length} result${results.length !== 1 ? 's' : ''}${archiveNote}`;
  }
  if (!results.length) {
    container.innerHTML = '<div class="global-search-card"><p class="story-card-excerpt">No results found.</p></div>';
    return;
  }
  container.innerHTML = results.map((item) => {
    const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const meta = [item.source, dateStr].filter(Boolean).join(' &middot; ');
    return `<div class="global-search-card">
      <div class="meta">${meta}</div>
      <h4><a href="${item.slug ? `/story/${escapeHtml(item.slug)}` : escapeHtml(item.url || '#')}"${item.slug ? '' : ' target="_blank" rel="noopener"'}>${escapeHtml(item.title)}</a></h4>
      ${item.summary ? `<p class="story-card-excerpt">${escapeHtml(item.summary)}</p>` : ''}
    </div>`;
  }).join('');
}

export function renderStoryPage(story) {
  if (!story) return;
  const title = document.getElementById('storyTitle');
  const dek = document.getElementById('storyDek');
  const updated = document.getElementById('storyUpdated');
  const verification = document.getElementById('storyVerification');
  const confidence = document.getElementById('storyConfidence');
  const tags = document.getElementById('storyTags');
  const why = document.getElementById('storyWhy');
  const next = document.getElementById('storyNext');
  const timeline = document.getElementById('storyTimeline');
  const sources = document.getElementById('storySources');
  const docs = document.getElementById('storyDocs');
  const related = document.getElementById('storyRelated');
  const corrections = document.getElementById('storyCorrections');
  const correctionsSection = document.getElementById('storyCorrectionsSection');
  const spectrum = document.getElementById('storySpectrum');
  const saveBtn = document.getElementById('storySaveBtn');
  const followBtn = document.getElementById('storyFollowBtn');

  if (title) title.textContent = story.headline;
  if (dek) dek.textContent = story.dek || '';
  if (updated) updated.textContent = `Updated ${formatDate(story.updatedAt)} ${formatTime(story.updatedAt)}`;
  if (verification) verification.textContent = story.verificationTier || 'Verification';
  if (confidence) confidence.textContent = `Confidence ${story.confidenceLabel || ''}`;
  if (tags) tags.innerHTML = (story.topics || []).map((topic) => `<span class="story-tag">${escapeHtml(topic)}</span>`).join('');
  if (saveBtn) saveBtn.dataset.save = story.id;
  if (followBtn) followBtn.dataset.follow = story.topics?.[0] || '';
  if (why) why.textContent = story.whyItMatters || '';
  if (next) next.textContent = story.whatsNext || '';
  if (timeline) {
    timeline.innerHTML = (story.timeline || []).map((item) => `<div class="story-timeline-item"><div class="story-card-title">${escapeHtml(item.title)}</div><div class="story-card-footer">${escapeHtml(item.source)} &middot; ${formatDate(item.publishedAt)}</div></div>`).join('');
  }
  if (sources) {
    sources.innerHTML = (story.sources || []).map((item) => `<div class="story-source-item"><div class="story-card-title">${escapeHtml(item.name)}</div><div class="story-card-footer">${escapeHtml(item.tierLabel || '')}</div></div>`).join('');
  }
  if (docs) {
    docs.innerHTML = (story.primaryDocs || []).map((doc) => `<div class="story-doc-item"><a href="${escapeHtml(doc.url)}" target="_blank" rel="noopener">${escapeHtml(doc.title)}</a>${doc.label ? `<div class="story-card-footer">${escapeHtml(doc.label)}</div>` : ''}</div>`).join('') || '<div class="story-doc-item">Primary filings listed when available.</div>';
  }
  if (related) {
    related.innerHTML = (story.related || []).map((item) => `<div class="story-related-item"><a href="/story/${escapeHtml(item.slug)}">${escapeHtml(item.headline)}</a></div>`).join('') || '<div class="story-related-item">No related clusters yet.</div>';
  }
  if (corrections && correctionsSection) {
    if (story.corrections && story.corrections.length) {
      correctionsSection.style.display = '';
      corrections.innerHTML = story.corrections.map((item) => `<div class="story-correction-item">${escapeHtml(item)}</div>`).join('');
    } else {
      correctionsSection.style.display = 'none';
    }
  }
  if (spectrum) {
    spectrum.innerHTML = (story.spectrum || []).map((row) => `<div class="spectrum-row"><span class="spectrum-label">${escapeHtml(row.label)}</span><div class="spectrum-bar-track"><div class="spectrum-bar-fill" style="width:${Number(row.percent)||0}%;background:${escapeHtml(row.color||'')}"></div></div><span class="spectrum-count">${row.count}</span></div>`).join('');
  }
  renderArticleJsonLd(story);
}

/**
 * Render the historical archive from the /api/archive response format.
 * Each entry is { date, count, stories[] }.
 * Renders a date-chip nav strip + a per-day section with a card grid.
 */
export function renderArchiveDays(days = []) {
  const container = document.getElementById('archiveContent');
  if (!container) return;
  if (!days.length) {
    container.innerHTML = '<div class="story-card"><h3 class="story-card-title">No archive data yet</h3><p class="story-card-excerpt">Run a refresh to start building the archive. Historical data accumulates after each successful run.</p></div>';
    return;
  }

  // Date chip strip — clicking scrolls to the section for that date
  const chipNav = `<nav class="archive-date-nav" aria-label="Jump to date">${days.slice(0, 14).map((day, i) => {
    const label = formatArchiveDate(day.date);
    const short = day.date ? new Date(day.date + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : label;
    return `<button class="archive-date-chip${i === 0 ? ' active' : ''}" data-date-target="${escapeHtml(day.date || '')}" type="button" title="${escapeHtml(label)}">${escapeHtml(short)}</button>`;
  }).join('')}</nav>`;

  // Per-day sections with card grid
  const sections = days.map((day) => {
    const stories = (day.stories || []).slice().sort((a, b) => (b.score || 0) - (a.score || 0));
    const cards = stories.map((story) => {
      const score = story.score != null ? Math.round(story.score * 100) : '--';
      const sourceName = story.sources?.[0]?.name || story.source || '';
      const topic = (story.topics?.[0] || '').replace(/_/g, ' ');
      const topicRaw = story.topics?.[0] || '';
      const tier = story.tier || 3;
      const slug = story.slug ? escapeHtml(story.slug) : '';
      const time = formatTime(story.updatedAt || story.publishedAt);
      const { open, external } = renderStoryActions(story);
      const thumb = renderStoryThumb(story.imageUrl, 'archive-grid-thumb', story.headline || '', story.topics);
      const titleHtml = slug
        ? `<a href="/story/${slug}" onclick="window.openStory('${slug}');return false;">${escapeHtml(story.headline)}</a>`
        : escapeHtml(story.headline);
      return `<article class="archive-grid-card" data-topic="${escapeHtml(topicRaw)}" data-tier="${escapeHtml(String(tier))}" data-text="${escapeHtml((story.headline || '') + ' ' + (story.dek || '') + ' ' + sourceName).toLowerCase()}">
        ${thumb}
        <div class="archive-grid-body">
          <div class="archive-grid-tags">
            <span class="archive-grid-topic">${escapeHtml(topic || 'Intelligence')}</span>
            <span class="archive-grid-score">${score}</span>
          </div>
          <h3 class="archive-grid-title">${titleHtml}</h3>
          ${story.dek ? `<p class="archive-grid-dek">${escapeHtml(story.dek)}</p>` : ''}
          <div class="archive-grid-meta">${escapeHtml(sourceName)}${sourceName && time ? ' &middot; ' : ''}${escapeHtml(time)}</div>
          <div class="archive-card-actions">${open}${external}</div>
        </div>
      </article>`;
    }).join('');

    const label = formatArchiveDate(day.date);
    const dateStr = day.date ? new Date(day.date + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : label;
    return `<section class="archive-day-section" id="archive-day-${escapeHtml(day.date || '')}" data-date="${escapeHtml(day.date || '')}">
      <div class="archive-day-section-header">
        <h2 class="archive-day-section-title">${escapeHtml(dateStr)}</h2>
        <span class="archive-run-badge active">${stories.length} stor${stories.length === 1 ? 'y' : 'ies'}</span>
      </div>
      <div class="archive-grid">${cards || '<p class="archive-empty">No stories for this date.</p>'}</div>
    </section>`;
  }).join('');

  container.innerHTML = chipNav + sections;

  // Chip click — smooth-scroll to the target section and mark active chip
  container.parentElement.addEventListener('click', (e) => {
    const chip = e.target.closest('.archive-date-chip');
    if (!chip) return;
    const target = document.getElementById(`archive-day-${chip.dataset.dateTarget}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    container.querySelectorAll('.archive-date-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
  }, { passive: true });
}

function buildArchiveTimeGroups(stories = []) {
  const groups = [
    { key: 'morning', label: 'Morning', items: [] },
    { key: 'midday', label: 'Midday', items: [] },
    { key: 'evening', label: 'Evening', items: [] },
    { key: 'late', label: 'Late', items: [] }
  ];

  for (const story of stories) {
    const date = new Date(story.updatedAt || story.publishedAt || 0);
    const hour = Number.isNaN(date.getTime()) ? 12 : date.getHours();
    if (hour < 11) groups[0].items.push(story);
    else if (hour < 15) groups[1].items.push(story);
    else if (hour < 21) groups[2].items.push(story);
    else groups[3].items.push(story);
  }

  return groups.filter((group) => group.items.length);
}

function formatArchiveDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T12:00:00Z');
  if (isNaN(d)) return isoDate;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function renderScoringPanel(config = {}) {
  const sc = config.scoring || {};
  const imp = config.importance || {};
  const cl = config.clustering || {};
  const tw = sc.tierWeights || {};
  const tb = sc.topicBoosts || {};

  const setSlider = (id, val) => {
    const el = document.getElementById(id);
    const out = document.getElementById(`${id}-val`);
    if (!el) return;
    el.value = val;
    if (out) out.value = el.step === '1' ? String(Math.round(Number(val))) : Number(val).toFixed(2);
  };

  setSlider('sc-tier-1', tw['1'] ?? 1.0);
  setSlider('sc-tier-2', tw['2'] ?? 0.78);
  setSlider('sc-tier-3', tw['3'] ?? 0.58);
  setSlider('sc-halflife', sc.recencyHalfLifeHours ?? 10);
  setSlider('sc-local-boost', sc.localRegionBoost ?? 0.08);
  setSlider('sc-dupe-penalty', sc.duplicatePenalty ?? 0.15);
  setSlider('sc-imp-threshold', imp.scoreThreshold ?? 0.72);
  setSlider('sc-cluster-threshold', cl.similarityThreshold ?? 0.68);
  setSlider('sc-cluster-hours', cl.maxHours ?? 72);

  const triggersEl = document.getElementById('sc-imp-triggers');
  if (triggersEl) triggersEl.value = (imp.topicTriggers || []).join(', ');

  const grid = document.getElementById('scBoostGrid');
  if (grid && Object.keys(tb).length) {
    grid.innerHTML = Object.entries(tb).map(([topic, val]) => `
      <div class="sc-row">
        <label class="sc-label" for="sc-boost-${escapeHtml(topic)}">${escapeHtml(topic)}</label>
        <input type="range" id="sc-boost-${escapeHtml(topic)}" class="sc-slider sc-boost" data-topic="${escapeHtml(topic)}" min="0" max="0.5" step="0.01" value="${Number(val).toFixed(2)}">
        <output class="sc-val" id="sc-boost-${escapeHtml(topic)}-val">${Number(val).toFixed(2)}</output>
      </div>
    `).join('');
  }
}

export function renderDevelopingStrip(stories) {
  const developing = (stories || []).filter((s) => s.developing);
  const strip = document.getElementById('developing-strip');
  if (!strip) return;
  if (!developing.length) { strip.hidden = true; return; }
  strip.hidden = false;
  strip.innerHTML = developing.slice(0, 6).map((s) => `
    <div class="developing-card" data-slug="${escapeHtml(s.slug || '')}">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
        <span class="badge-developing">DEVELOPING</span>
      </div>
      <div class="developing-card-title">${escapeHtml(s.headline || s.dek || '')}</div>
      <div class="developing-card-source">${escapeHtml(s.sources?.[0]?.name || '')} &middot; ${escapeHtml(formatTime(s.publishedAt))}</div>
    </div>
  `).join('');
}

function renderArticleJsonLd(article) {
  const node = document.getElementById('jsonLdArticle');
  if (!node || !article) return;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline || article.title,
    datePublished: article.updatedAt || article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'The UnderCurrent'
    },
    mainEntityOfPage: article.canonicalUrl || article.url,
    author: {
      '@type': 'Organization',
      name: article.sources?.[0]?.name || article.source || 'The UnderCurrent'
    }
  };
  node.textContent = JSON.stringify(data);
}
