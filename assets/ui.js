import { submitForm, trackEvent } from './api.js';

const SAVED_KEY = 'uc_saved_stories';
const FOLLOW_KEY = 'uc_follow_topics';
const READER_KEY = 'uc_reader_mode';
const LAST_VISIT_KEY = 'uc_last_visit_at';
const WATCHES_KEY = 'uc_keyword_watches';
const READ_KEY = 'uc_read_stories';

// ── Read state ────────────────────────────────────────────────────────────────

export function getReadStories() {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); } catch { return new Set(); }
}

function saveReadStories(set) {
  try { localStorage.setItem(READ_KEY, JSON.stringify([...set].slice(-1000))); } catch { /* quota */ }
}

export function markAsRead(id) {
  if (!id) return;
  const read = getReadStories();
  if (read.has(id)) return;
  read.add(id);
  saveReadStories(read);
}

export function applyReadState() {
  const read = getReadStories();
  let unread = 0;
  let total = 0;
  document.querySelectorAll('[data-story-id]').forEach((card) => {
    const id = card.dataset.storyId;
    if (!id) return;
    total++;
    if (read.has(id)) {
      card.classList.add('story-card--read');
    } else {
      card.classList.remove('story-card--read');
      unread++;
    }
  });
  const badge = document.getElementById('unreadCount');
  if (badge) {
    if (total === 0) { badge.textContent = ''; return; }
    badge.textContent = unread > 0 ? `${unread} unread` : 'All read';
  }
}

export function initUnreadFilter() {
  const toggle = document.getElementById('unreadToggle');
  const list = document.getElementById('storyList');
  if (!toggle || !list || toggle.dataset.bound === '1') return;
  toggle.dataset.bound = '1';
  toggle.addEventListener('click', () => {
    const active = toggle.classList.toggle('active');
    list.classList.toggle('feed-unread-only', active);
    toggle.textContent = active ? 'All Stories' : 'Unread Only';
  });
}

export function initNavigation() {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => navigateTo(link.dataset.page));
    link.tabIndex = 0;
    link.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigateTo(link.dataset.page);
      }
    });
  });

  window.navigateTo = navigateTo;
  window.navigateSearch = navigateSearch;
  const mobile = document.getElementById('mobileNav');
  const mobileOpen = document.getElementById('mobileNavOpen');
  const mobileClose = document.getElementById('mobileNavClose');
  const mastheadButton = document.getElementById('mastheadButton');

  const closeMobileNav = () => {
    if (!mobile) return;
    mobile.classList.remove('open');
    mobile.setAttribute('aria-hidden', 'true');
    mobileOpen?.setAttribute('aria-expanded', 'false');
  };

  const openMobileNav = () => {
    if (!mobile) return;
    mobile.classList.add('open');
    mobile.setAttribute('aria-hidden', 'false');
    mobileOpen?.setAttribute('aria-expanded', 'true');
  };

  mastheadButton?.addEventListener('click', () => navigateTo('home'));
  mobileOpen?.addEventListener('click', openMobileNav);
  mobileClose?.addEventListener('click', closeMobileNav);

  document.querySelectorAll('[data-nav-target]').forEach((button) => {
    button.addEventListener('click', () => {
      navigateTo(button.dataset.navTarget);
      closeMobileNav();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileNav();
      const panel = document.getElementById('globalSearchPanel');
      if (panel) panel.style.display = 'none';
    }
  });
}

export function initRunSelector() {
  document.querySelectorAll('.run-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.run-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

export function initTierTabs() {
  document.querySelectorAll('.tier-tab').forEach((tab) => {
    if (tab.dataset.bound === '1') return;
    tab.dataset.bound = '1';
    tab.addEventListener('click', () => {
      const container = tab.closest('.tier-section') || document;
      container.querySelectorAll('.tier-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const tier = tab.dataset.tier;
      const activePills = [...document.querySelectorAll('#trending-bar .topic-pill.active')].map((p) => p.dataset.topic);
      const storyList = container.querySelector('#storyList') || container;
      storyList.querySelectorAll('.story-card').forEach((card) => {
        const tierMatch = tier === 'all' || card.dataset.tier === tier;
        const topicMatch = !activePills.length || activePills.some((t) => (card.dataset.topics || '').split(',').includes(t));
        card.style.display = tierMatch && topicMatch ? '' : 'none';
      });
    });
  });
}

export function initTopicFilters() {
  const today = new Date().toISOString().slice(0, 10);
  const applyTopicView = () => {
    const activeTopic = document.querySelector('.topic-chip.active')?.dataset.topic || 'all';
    const query = (document.getElementById('topicsSearch')?.value || '').toLowerCase();
    document.querySelectorAll('.topic-section').forEach((section) => {
      const topicMatches = activeTopic === 'all' || activeTopic === 'today' || section.dataset.topicSection === activeTopic;
      let visible = 0;
      section.querySelectorAll('.topic-date-group').forEach((group) => {
        const isCollapsed = group.classList.contains('collapsed');
        let groupVisible = 0;
        group.querySelectorAll('.topic-story').forEach((story) => {
          const dateMatches = activeTopic !== 'today' || story.dataset.storyDate === today;
          const queryMatches = !query || story.textContent.toLowerCase().includes(query);
          // Respect collapsed state: hide stories in collapsed groups
          const show = topicMatches && dateMatches && queryMatches && !isCollapsed;
          story.style.display = show ? '' : 'none';
          if (topicMatches && dateMatches && queryMatches) {
            groupVisible++;
            visible++;
          }
        });
        group.style.display = topicMatches && groupVisible > 0 ? '' : 'none';
      });
      section.style.display = topicMatches && visible > 0 ? '' : 'none';
    });
  };

  document.querySelectorAll('.topic-chip').forEach((chip) => {
    if (chip.dataset.bound === '1') return;
    chip.dataset.bound = '1';
    chip.addEventListener('click', () => {
      document.querySelectorAll('.topic-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      applyTopicView();
    });
  });

  const topicsSearch = document.getElementById('topicsSearch');
  if (topicsSearch && topicsSearch.dataset.bound !== '1') {
    topicsSearch.dataset.bound = '1';
    topicsSearch.addEventListener('input', () => {
      applyTopicView();
    });
  }

  // Collapse/expand date-group headers via event delegation (bound once globally)
  if (document.body.dataset.topicGroupToggleBound !== '1') {
    document.body.dataset.topicGroupToggleBound = '1';
    document.body.addEventListener('click', (e) => {
      const header = e.target.closest('[data-toggle-topic-group]');
      if (!header) return;
      const group = header.closest('.topic-date-group');
      if (!group) return;
      group.classList.toggle('collapsed');
      applyTopicView();
    });
  }

  applyTopicView();
}

export function initSearchFilter(onSearch) {
  const input = document.getElementById('searchInput');
  const tier = document.getElementById('searchTier');
  const topic = document.getElementById('searchTopic');
  const source = document.getElementById('searchSource');
  const from = document.getElementById('searchFrom');
  const to = document.getElementById('searchTo');
  const handler = () => {
    onSearch({
      query: input?.value || '',
      tier: tier?.value || '',
      topic: topic?.value || '',
      source: source?.value || '',
      from: from?.value || '',
      to: to?.value || ''
    });
  };
  if (input && input.dataset.bound !== '1') { input.dataset.bound = '1'; input.addEventListener('input', handler); }
  if (tier && tier.dataset.bound !== '1') { tier.dataset.bound = '1'; tier.addEventListener('change', handler); }
  if (topic && topic.dataset.bound !== '1') { topic.dataset.bound = '1'; topic.addEventListener('input', handler); }
  if (source && source.dataset.bound !== '1') { source.dataset.bound = '1'; source.addEventListener('input', handler); }
  if (from && from.dataset.bound !== '1') { from.dataset.bound = '1'; from.addEventListener('change', handler); }
  if (to && to.dataset.bound !== '1') { to.dataset.bound = '1'; to.addEventListener('change', handler); }
}

export function initForms() {
  const contactSubmit = document.getElementById('contactSubmit');
  const sourceSubmit = document.getElementById('sourceSubmit');
  const topicSubmit = document.getElementById('topicSubmit');

  contactSubmit?.addEventListener('click', async (event) => {
    event.preventDefault();
    const status = document.getElementById('contactStatus');
    status.textContent = 'Sending...';
    try {
      await submitForm('/api/contact', {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        category: document.getElementById('contactCategory').value,
        message: document.getElementById('contactMessage').value,
        company: document.getElementById('contactCompany').value
      });
      status.textContent = 'Message received. We will respond shortly.';
      trackEvent('contact_submit');
    } catch (err) {
      status.textContent = err.message;
    }
  });

  sourceSubmit?.addEventListener('click', async (event) => {
    event.preventDefault();
    const status = document.getElementById('sourceStatus');
    status.textContent = 'Submitting...';
    try {
      await submitForm('/api/submit-source', {
        name: document.getElementById('sourceName').value,
        url: document.getElementById('sourceUrl').value,
        rationale: document.getElementById('sourceRationale').value,
        website: document.getElementById('sourceWebsite').value
      });
      status.textContent = 'Thanks. We will review this source.';
      trackEvent('source_submit');
    } catch (err) {
      status.textContent = err.message;
    }
  });

  topicSubmit?.addEventListener('click', async (event) => {
    event.preventDefault();
    const status = document.getElementById('topicStatus');
    status.textContent = 'Submitting...';
    try {
      await submitForm('/api/request-topic', {
        topic: document.getElementById('topicName').value,
        context: document.getElementById('topicContext').value,
        website: document.getElementById('topicWebsite').value
      });
      status.textContent = 'Topic request received.';
      trackEvent('topic_submit');
    } catch (err) {
      status.textContent = err.message;
    }
  });
}

export function initCtas() {
  document.querySelectorAll('[data-track]').forEach((button) => {
    button.addEventListener('click', async () => {
      const key = button.dataset.track || '';
      if (key === 'open_weekly_digest') {
        if (typeof window.openDigest === 'function') {
          await window.openDigest('latest');
        } else {
          navigateTo('digest');
        }
      } else if (key === 'open_todays_top10') {
        navigateTo('home');
        document.getElementById('weeklyDigest')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (key === 'save_later') {
        const first = document.querySelector('.story-card [data-save]');
        first?.click();
      }
      trackEvent(button.dataset.track || 'cta_click');
    });
  });
}

export function initSaveFollow() {
  document.body.addEventListener('click', (event) => {
    const target = event.target.closest('[data-save], [data-follow]');
    if (!target) return;
    if (target.dataset.save) {
      toggleSavedStory(target.dataset.save);
      applySaveFollowState();
      trackEvent('story_save', { id: target.dataset.save });
    }
    if (target.dataset.follow) {
      toggleFollowTopic(target.dataset.follow);
      applySaveFollowState();
      trackEvent('topic_follow', { topic: target.dataset.follow });
    }
  });
}

export function initReaderMode() {
  const toggle = document.getElementById('readerToggle');
  const current = localStorage.getItem(READER_KEY) === 'true';
  if (current) document.body.classList.add('reader-mode');
  if (toggle) {
    toggle.classList.toggle('active', current);
    toggle.addEventListener('click', () => {
      const next = !document.body.classList.contains('reader-mode');
      document.body.classList.toggle('reader-mode', next);
      toggle.classList.toggle('active', next);
      try { localStorage.setItem(READER_KEY, String(next)); } catch { /* quota */ }
    });
  }
}

export function initShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, textarea')) return;
    if (event.key === '/') {
      event.preventDefault();
      const input = document.getElementById('globalSearchInput');
      if (input) input.focus();
    }
    if (event.key.toLowerCase() === 's') {
      const active = document.querySelector('.story-card');
      const id = active?.dataset.storyId;
      if (id) {
        toggleSavedStory(id);
        applySaveFollowState();
      }
    }
  });
}

export function initGlobalSearch(onSearch) {
  const navInput = document.getElementById('globalSearchInput');
  const panel = document.getElementById('globalSearchPanel');
  const queryInput = document.getElementById('globalSearchQuery');
  const source = document.getElementById('globalSearchSource');
  const topic = document.getElementById('globalSearchTopic');
  const tier = document.getElementById('globalSearchTier');
  const from = document.getElementById('globalSearchFrom');
  const to = document.getElementById('globalSearchTo');

  const handler = () => {
    const q = queryInput?.value || navInput?.value || '';
    if (!panel) return;
    if (!q.trim()) {
      panel.style.display = 'none';
      return;
    }
    panel.style.display = '';
    onSearch({
      q,
      source: source?.value || '',
      topic: topic?.value || '',
      tier: tier?.value || '',
      from: from?.value || '',
      to: to?.value || ''
    });
  };

  navInput?.addEventListener('input', () => {
    if (queryInput) queryInput.value = navInput.value;
    handler();
  });
  queryInput?.addEventListener('input', handler);
  source?.addEventListener('input', handler);
  topic?.addEventListener('input', handler);
  tier?.addEventListener('change', handler);
  from?.addEventListener('change', handler);
  to?.addEventListener('change', handler);
}

export function initArchiveWeekToggles() {
  document.body.addEventListener('click', (event) => {
    const header = event.target.closest('[data-toggle-week]');
    if (!header) return;
    const week = header.closest('.archive-week');
    if (!week) return;
    week.classList.toggle('collapsed');
  });
}

export function getSavedStories() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getFollowedTopics() {
  try {
    return JSON.parse(localStorage.getItem(FOLLOW_KEY) || '[]');
  } catch {
    return [];
  }
}

function toggleSavedStory(id) {
  const items = new Set(getSavedStories());
  if (items.has(id)) items.delete(id); else items.add(id);
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(items))); } catch { /* quota */ }
}

function toggleFollowTopic(topic) {
  if (!topic) return;
  const items = new Set(getFollowedTopics());
  if (items.has(topic)) items.delete(topic); else items.add(topic);
  try { localStorage.setItem(FOLLOW_KEY, JSON.stringify(Array.from(items))); } catch { /* quota */ }
}

// ─── Keyword Watches ──────────────────────────────────────────────────────────

export function getWatches() {
  try {
    return JSON.parse(localStorage.getItem(WATCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveWatches(watches) {
  try { localStorage.setItem(WATCHES_KEY, JSON.stringify(watches)); } catch { /* quota or private browsing */ }
}

function addWatch(keyword) {
  const kw = keyword.trim().toLowerCase().slice(0, 60);
  if (!kw) return false;
  const current = getWatches();
  if (current.includes(kw)) return false;
  saveWatches([...current, kw]);
  return true;
}

function removeWatch(keyword) {
  saveWatches(getWatches().filter((k) => k !== keyword));
}

function renderWatchesList() {
  const container = document.getElementById('watchesList');
  if (!container) return;
  const watches = getWatches();
  if (!watches.length) {
    container.innerHTML = '<p class="watches-empty">No watches yet. Add a keyword to get targeted alerts.</p>';
    return;
  }
  container.innerHTML = watches.map((kw) =>
    `<span class="watch-chip"><span class="watch-chip-label">${kw}</span><button class="watch-chip-remove" data-remove-watch="${kw}" title="Remove" aria-label="Remove watch for ${kw}">&#10005;</button></span>`
  ).join('');
}

export function initKeywordWatches() {
  renderWatchesList();
  const input = document.getElementById('watchInput');
  const addBtn = document.getElementById('watchAdd');
  if (input && addBtn) {
    const doAdd = () => {
      if (addWatch(input.value)) {
        input.value = '';
        renderWatchesList();
      }
    };
    addBtn.addEventListener('click', doAdd);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } });
  }
  const list = document.getElementById('watchesList');
  if (list) {
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-watch]');
      if (!btn) return;
      removeWatch(btn.dataset.removeWatch);
      renderWatchesList();
    });
  }
}

export function applySaveFollowState() {
  const saved = new Set(getSavedStories());
  const followed = new Set(getFollowedTopics());
  document.querySelectorAll('[data-save]').forEach((btn) => {
    const id = btn.dataset.save;
    if (saved.has(id)) {
      btn.classList.add('active');
      btn.textContent = 'Saved';
    } else {
      btn.classList.remove('active');
      btn.textContent = 'Save';
    }
  });
  document.querySelectorAll('[data-follow]').forEach((btn) => {
    const topic = btn.dataset.follow;
    if (followed.has(topic)) {
      btn.classList.add('active');
      btn.textContent = 'Following';
    } else {
      btn.classList.remove('active');
      btn.textContent = 'Follow Topic';
    }
  });
}

/**
 * Record the current time as "last visit" and return the previous visit time.
 * Call this once on page load after rendering is complete.
 */
export function recordVisitAndGetLastTime() {
  const prev = localStorage.getItem(LAST_VISIT_KEY);
  try { localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString()); } catch { /* quota */ }
  return prev || null;
}

/**
 * Return the ISO string of the user's previous visit, or null if first visit.
 */
export function getLastVisitAt() {
  return localStorage.getItem(LAST_VISIT_KEY) || null;
}

/**
 * Export the current briefing (store snapshot) as a downloadable JSON file.
 */
export function exportBriefing(store) {
  const snapshot = {
    exportedAt: new Date().toISOString(),
    brief: store.brief || null,
    topStories: (store.stories || []).slice(0, 10).map((s) => ({
      headline: s.headline,
      dek: s.dek,
      topics: s.topics,
      whyItMatters: s.whyItMatters,
      sources: s.sources?.map((src) => src.name),
      url: s.url,
      publishedAt: s.publishedAt
    })),
    marketIntelligence: store.marketIntelligence || null,
    generatedAt: store.lastUpdated || null
  };
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `undercurrent-briefing-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Export briefing as plain-text for copy/paste or email.
 */
export function exportBriefingText(store) {
  const lines = [];
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  lines.push(`THE UNDERCURRENT — Daily Intelligence Briefing`);
  lines.push(date);
  lines.push('');

  if (store.brief?.lead) {
    lines.push('EXECUTIVE SUMMARY');
    lines.push(store.brief.lead);
    (store.brief.bullets || []).forEach((b) => lines.push(`• ${b}`));
    lines.push('');
  }

  lines.push('TOP STORIES');
  (store.stories || []).slice(0, 10).forEach((s, i) => {
    lines.push(`${i + 1}. ${s.headline}`);
    if (s.whyItMatters) lines.push(`   Why it matters: ${s.whyItMatters}`);
    if (s.url) lines.push(`   ${s.url}`);
  });

  if (store.marketIntelligence?.summary) {
    lines.push('');
    lines.push('MARKET INTELLIGENCE');
    lines.push(`Pulse: ${store.marketIntelligence.pulse} · Regime: ${store.marketIntelligence.regime}`);
    lines.push(store.marketIntelligence.summary);
    (store.marketIntelligence.signals || []).forEach((sig) => lines.push(`• ${sig}`));
  }

  lines.push('');
  lines.push('—');
  lines.push('The UnderCurrent — theundercurrent.com');

  const text = lines.join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `undercurrent-briefing-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Copy story URL to clipboard. Returns true on success.
 */
export async function copyStoryLink(url, title) {
  try {
    const text = title ? `${title}\n${url}` : url;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Init "My Topics" filter button — shows only stories from followed topics.
 */
export function initMyTopicsFilter(getStore) {
  document.body.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-my-topics]');
    if (!btn) return;

    const active = btn.classList.toggle('active');
    const store = getStore();
    const followed = new Set(getFollowedTopics());

    document.querySelectorAll('.story-card').forEach((card) => {
      if (!active) {
        card.style.display = '';
        return;
      }
      const topicsAttr = card.dataset.topics || '';
      const cardTopics = topicsAttr.split(',').map((t) => t.trim());
      const match = followed.size === 0 || cardTopics.some((t) => followed.has(t));
      card.style.display = match ? '' : 'none';
    });

    btn.textContent = active ? 'All Stories' : 'My Topics';
  });
}

function escapeHtmlUi(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Dark mode toggle
export function initDarkMode() {
  const toggle = document.getElementById('dark-mode-toggle');
  const icon = document.getElementById('dark-mode-icon');
  const saved = localStorage.getItem('uc_dark_mode');
  if (saved === 'true') {
    document.body.classList.add('dark-mode');
    if (icon) icon.textContent = '\u2600\uFE0F';
  }
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('uc_dark_mode', isDark);
      if (icon) icon.textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    });
  }
}

// Nav More dropdown
export function initNavMore() {
  const btn = document.getElementById('nav-more-btn');
  const dropdown = document.getElementById('nav-more-dropdown');
  if (!btn || !dropdown) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  dropdown.querySelectorAll('.nav-more-item').forEach((item) => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) navigateTo(page);
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });
}

// Alert strip for developing stories
export function initAlertStrip(stories) {
  const strip = document.getElementById('alert-strip');
  const text = document.getElementById('alert-strip-text');
  if (!strip || !text) return;
  const developing = (stories || []).find((s) => s.developing);
  if (developing) {
    text.textContent = developing.headline || developing.dek || '';
    strip.hidden = false;
  }
}

// Trending topics bar
export function renderTrendingBar(stories) {
  const bar = document.getElementById('trending-bar');
  if (!bar) return;
  const degrees = {};
  const labelMap = {
    economy: 'Economy', uspolitics: 'US Politics', geopolitics: 'Geopolitics',
    tech: 'Tech', law: 'Law', defense: 'Defense', global_trade: 'Trade',
    health: 'Health', elections: 'Elections', finance: 'Finance',
  };
  (stories || []).forEach((s) => (s.topics || []).forEach((t) => { degrees[t] = (degrees[t] || 0) + 1; }));
  const top5 = Object.entries(degrees).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!top5.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';
  bar.innerHTML = `<span class="trending-label">Trending:</span>` +
    top5.map(([id]) => {
      const TOPIC_COLORS = { economy:'#22c55e',uspolitics:'#6366f1',geopolitics:'#38bdf8',tech:'#a78bfa',defense:'#f59e0b',health:'#34d399',law:'#f97316',finance:'#0ea5e9',global_trade:'#e879f9',elections:'#ef4444' };
      const color = TOPIC_COLORS[id] || '#94a3b8';
      return `<button class="topic-pill" data-topic="${escapeHtmlUi(id)}" style="border-left:3px solid ${color}">${escapeHtmlUi(labelMap[id] || id)}</button>`;
    }).join('');
  bar.querySelectorAll('.topic-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      filterFeedByTopic(pill.dataset.topic);
    });
  });
}

// Editors' Picks sidebar pod
export function renderEditorsPicks(stories) {
  const card = document.getElementById('editors-picks');
  const list = document.getElementById('editors-picks-list');
  if (!card || !list) return;
  const picks = (stories || [])
    .filter((s) => (s.score || 0) >= 0.7 && s.verificationTier === 'Corroborated')
    .slice(0, 3);
  if (!picks.length) { card.style.display = 'none'; return; }
  card.style.display = 'block';
  list.innerHTML = picks.map((s) => `
    <div class="editors-pick-item" style="cursor:pointer">
      <div class="editors-pick-title">${escapeHtmlUi(s.headline || s.dek || '')}</div>
      <div class="editors-pick-meta">${escapeHtmlUi(s.sources?.[0]?.name || '')}</div>
    </div>
  `).join('');
}

// SSE feed updates subscriber
export function subscribeToFeedUpdates() {
  if (typeof EventSource === 'undefined') return;
  const es = new EventSource('/api/feed-updates');
  es.addEventListener('refresh', (e) => {
    try {
      const data = JSON.parse(e.data);
      showRefreshBanner(data.storyCount, data.briefLead);
    } catch { /* ignore */ }
  });
  es.onerror = () => { es.close(); setTimeout(subscribeToFeedUpdates, 30000); };
}

function showRefreshBanner(storyCount, briefLead) {
  const banner = document.getElementById('refresh-banner');
  const text = document.getElementById('refresh-banner-text');
  if (!banner || !text) return;
  text.textContent = `${storyCount} stories updated` + (briefLead ? ` \u00B7 ${briefLead.slice(0, 60)}${briefLead.length > 60 ? '\u2026' : ''}` : '');
  banner.classList.add('visible');
}

// Topic-based feed filter
export function filterFeedByTopic(topicId) {
  const bar = document.getElementById('trending-bar');
  if (topicId !== undefined) {
    // Toggle active on the pill
    const pill = bar?.querySelector(`.topic-pill[data-topic="${CSS.escape(topicId)}"]`);
    if (pill) pill.classList.toggle('active');
  }
  const activePills = bar ? [...bar.querySelectorAll('.topic-pill.active')].map((p) => p.dataset.topic) : [];
  const storyList = document.getElementById('storyList');
  if (!storyList) return;
  const activeTierTab = document.querySelector('.tier-tab.active');
  const activeTier = activeTierTab ? activeTierTab.dataset.tier : 'all';
  storyList.querySelectorAll('.story-card').forEach((card) => {
    const topicMatch = !activePills.length || (card.dataset.topics || '').split(',').some((t) => activePills.includes(t));
    const tierMatch = activeTier === 'all' || card.dataset.tier === activeTier;
    card.style.display = topicMatch && tierMatch ? '' : 'none';
  });
}

window._filterFeedByTopic = filterFeedByTopic;

// Search navigation helper
export function navigateSearch(query) {
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.value = query;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  navigateTo('home');
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('.nav-link').forEach((l) => {
    if (l.dataset.page === page) l.classList.add('active');
  });
}

export function initTopicBreakdownStrip() {
  const strip = document.getElementById('topicBreakdownStrip');
  if (!strip || strip.dataset.bound === '1') return;
  strip.dataset.bound = '1';
  strip.addEventListener('click', (e) => {
    const chip = e.target.closest('.topic-breakdown-chip');
    if (!chip) return;
    filterFeedByTopic(chip.dataset.topic);
  });
}
