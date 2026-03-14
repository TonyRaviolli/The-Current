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
      document.querySelectorAll('.tier-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const tier = tab.dataset.tier;
      document.querySelectorAll('.story-card').forEach((card) => {
        if (tier === 'all' || card.dataset.tier === tier) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
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
        let groupVisible = 0;
        group.querySelectorAll('.topic-story').forEach((story) => {
          const dateMatches = activeTopic !== 'today' || story.dataset.storyDate === today;
          const queryMatches = !query || story.textContent.toLowerCase().includes(query);
          const show = topicMatches && dateMatches && queryMatches;
          story.style.display = show ? '' : 'none';
          if (show) {
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
