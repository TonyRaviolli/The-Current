import { fetchFeed, runRefresh, fetchResources, fetchSearch, fetchStory, fetchDigest, trackEvent, fetchSources, toggleSource, addSource, deleteSource, fetchScoring, saveScoring, invalidateFeedCache, adminQuerySuffix, setAdminToken } from './api.js';
import { renderHero, renderTopStories, renderDailyFeed, renderHighImportance, renderArchive, renderTopics, renderDailyInsight, renderResources, renderWeeklyDigest, renderMetaRibbon, renderTodayBrief, renderDeveloping, renderTopicBlocks, renderGlobalSearchResults, renderStoryPage, renderDigestPage, renderOps, renderSinceLastVisit, renderArchiveDays, renderSourceManager, renderScoringPanel, renderMarketIntel, renderCartoons, renderDevelopingStrip, renderMarketHeatmap } from './render.js';
import { initNavigation, initRunSelector, initTierTabs, initTopicFilters, initSearchFilter, initForms, initCtas, initSaveFollow, getSavedStories, getFollowedTopics, initReaderMode, initShortcuts, initGlobalSearch, applySaveFollowState, initArchiveWeekToggles, recordVisitAndGetLastTime, exportBriefing, exportBriefingText, copyStoryLink, initMyTopicsFilter, getWatches, initKeywordWatches, markAsRead, applyReadState, initUnreadFilter, initDarkMode, initNavMore, initAlertStrip, renderTrendingBar, renderEditorsPicks, subscribeToFeedUpdates } from './ui.js';

const refreshButton = document.getElementById('refreshButton');
const refreshStatus = document.getElementById('refreshStatus');

const creatures = [
  `  ~~     ~~\n ^  \\___/  ^\n  \\_o   o_/\n    \\_~_/\n     |_|\n  ~~~   ~~~`,
  `    ___\n   /o o\\\n  | \\_/ |\n   \\___/\n  //   \\\\\n _||   ||_`,
  `     /\\\n    /  \\\n   / /\\ \\
  / /  \\ \\
 |  \\__/  |\n  \\______/`
];
const depths = [
  'DEPTH 1,847M — CONTINENTAL SHELF',
  'DEPTH 2,400M — ABYSSAL PLAIN',
  'DEPTH 3,200M — MID-OCEAN RIDGE'
];

let storeCache = null;

function bootstrapAdminTokenFromUrl() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('admin_token');
  if (!token) return;
  setAdminToken(token);
  url.searchParams.delete('admin_token');
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

function getBootData() {
  const node = document.getElementById('bootData');
  if (!node) return {};
  try {
    return JSON.parse(node.textContent || '{}');
  } catch {
    return {};
  }
}

async function loadAll() {
  try {
    console.info('[uc] loadAll:start');
    bootstrapAdminTokenFromUrl();
    const lastVisitAt = recordVisitAndGetLastTime();
    const store = await fetchFeed();
    storeCache = store;
    try { sessionStorage.setItem('uc:known_ids', JSON.stringify((store.stories || []).map((s) => s.id))); } catch { /* quota */ }
    const saved = new Set(getSavedStories());
    const followed = new Set(getFollowedTopics());
    renderMetaRibbon(store);
    renderTodayBrief(store);
    renderHero(store);
    renderTopStories(store);
    renderDeveloping(store);
    renderTopicBlocks(store);
    renderDailyInsight(store);
    renderMarketIntel(store);
    renderMarketHeatmap(store.stories, document.getElementById('market-heatmap-container'));
    renderDevelopingStrip(store.stories);
    initAlertStrip(store.stories);
    renderTrendingBar(store.stories);
    renderEditorsPicks(store.stories);
    renderCartoons(store);
    const feedResult = renderDailyFeed(store, saved, followed, lastVisitAt);
    renderSinceLastVisit(feedResult?.newCount || 0, lastVisitAt);
    renderHighImportance(store);
    await loadAndRenderArchive();
    renderTopics(store);
    renderWeeklyDigest(store);
    renderOps(store);
    if (refreshStatus && store.lastUpdated) refreshStatus.textContent = `Updated ${new Date(store.lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    if ((!store.stories || !store.stories.length) && refreshStatus) {
      refreshStatus.textContent = 'No new items from sources in this run';
    }
    hideLoader();
    applySaveFollowState();
    applyReadState();
    initDepthInteractions();
    initMarketTiles();
    initReveal();
    initShareButtons();
    console.info('[uc] loadAll:done', { stories: store.stories?.length || 0, updated: store.lastUpdated || null });
  } catch (err) {
    console.error(err);
    if (refreshStatus) refreshStatus.textContent = 'Feed unavailable';
  }
}

async function loadResources() {
  try {
    const resources = await fetchResources();
    renderResources(resources.items || []);
  } catch (err) {
    console.error(err);
  }
}

async function loadScoring() {
  try {
    const config = await fetchScoring();
    renderScoringPanel(config);
  } catch (err) {
    console.error('[uc] scoring load failed:', err);
  }
}

function initScoringPanel() {
  const panel = document.getElementById('scoringPanel');
  if (!panel) return;

  // Live slider → output value sync
  panel.addEventListener('input', (e) => {
    const slider = e.target.closest('.sc-slider');
    if (!slider) return;
    const out = document.getElementById(`${slider.id}-val`);
    if (out) out.value = slider.step === '1' ? String(Math.round(Number(slider.value))) : Number(slider.value).toFixed(2);
  });

  const statusEl = document.getElementById('scStatus');

  // Save
  const saveBtn = document.getElementById('scSaveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const val = (id) => Number(document.getElementById(id)?.value);
      const topicBoosts = {};
      panel.querySelectorAll('.sc-boost').forEach((el) => {
        topicBoosts[el.dataset.topic] = Number(el.value);
      });
      const triggersRaw = document.getElementById('sc-imp-triggers')?.value || '';
      const topicTriggers = triggersRaw.split(',').map((t) => t.trim()).filter(Boolean);
      const payload = {
        scoring: {
          tierWeights: { '1': val('sc-tier-1'), '2': val('sc-tier-2'), '3': val('sc-tier-3') },
          topicBoosts,
          recencyHalfLifeHours: val('sc-halflife'),
          localRegionBoost: val('sc-local-boost'),
          duplicatePenalty: val('sc-dupe-penalty')
        },
        importance: { scoreThreshold: val('sc-imp-threshold'), topicTriggers },
        clustering: { similarityThreshold: val('sc-cluster-threshold'), maxHours: val('sc-cluster-hours') }
      };
      saveBtn.disabled = true;
      if (statusEl) statusEl.textContent = 'Saving\u2026';
      try {
        await saveScoring(payload);
        if (statusEl) statusEl.textContent = 'Saved \u2014 takes effect on next refresh.';
        setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 4000);
      } catch (err) {
        if (statusEl) statusEl.textContent = err.message || 'Save failed.';
      } finally {
        saveBtn.disabled = false;
      }
    });
  }

  // Reset (reload from server)
  const resetBtn = document.getElementById('scResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      await loadScoring();
      if (statusEl) statusEl.textContent = 'Reset to server values.';
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2000);
    });
  }
}

async function loadSources() {
  try {
    const data = await fetchSources();
    renderSourceManager(data);
  } catch (err) {
    console.error('[uc] sources load failed:', err);
  }
}

function initSourceManager() {
  const list = document.getElementById('sourceManagerList');
  if (!list) return;

  // Toggle and remove via delegated clicks on the list
  list.addEventListener('click', async (e) => {
    const toggleBtn = e.target.closest('[data-toggle]');
    if (toggleBtn) {
      toggleBtn.disabled = true;
      try {
        await toggleSource(toggleBtn.dataset.toggle);
        await loadSources();
      } catch { /* ignore */ } finally {
        toggleBtn.disabled = false;
      }
    }
    const removeBtn = e.target.closest('[data-remove]');
    if (removeBtn) {
      if (removeBtn.dataset.confirm !== '1') {
        removeBtn.dataset.confirm = '1';
        removeBtn.title = 'Click again to confirm removal';
        removeBtn.textContent = '?';
        setTimeout(() => { if (removeBtn.dataset.confirm) { delete removeBtn.dataset.confirm; removeBtn.textContent = '✕'; removeBtn.title = 'Remove source'; } }, 3000);
        return;
      }
      removeBtn.disabled = true;
      try {
        await deleteSource(removeBtn.dataset.remove);
        await loadSources();
      } catch { /* ignore */ } finally {
        removeBtn.disabled = false;
      }
    }
  });

  // Add source form
  const addBtn = document.getElementById('smAddBtn');
  const statusEl = document.getElementById('smAddStatus');
  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      const name = document.getElementById('smName')?.value?.trim();
      const url = document.getElementById('smUrl')?.value?.trim();
      const tier = document.getElementById('smTier')?.value;
      const orientation = document.getElementById('smOrientation')?.value;
      const topics = document.getElementById('smTopics')?.value;
      if (!name || !url) { if (statusEl) statusEl.textContent = 'Name and URL are required.'; return; }
      addBtn.disabled = true;
      if (statusEl) statusEl.textContent = 'Adding…';
      try {
        await addSource({ name, url, tier, orientation, topics });
        if (statusEl) statusEl.textContent = 'Added.';
        ['smName', 'smUrl', 'smTopics'].forEach((id) => { const el = document.getElementById(id); if (el) el.value = ''; });
        await loadSources();
        setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
      } catch (err) {
        if (statusEl) statusEl.textContent = err.message || 'Failed to add source.';
      } finally {
        addBtn.disabled = false;
      }
    });
  }
}

async function loadAndRenderArchive(range = 'week') {
  try {
    const res = await fetch(`/api/archive?range=${encodeURIComponent(range)}`);
    const data = await res.json();
    renderArchiveDays(data.days || []);
    initArchiveWeekToggles();
  } catch (err) {
    console.error('[uc] archive load failed:', err);
  }
}

function getNewStories(stories) {
  try {
    const known = new Set(JSON.parse(sessionStorage.getItem('uc:known_ids') || '[]'));
    return stories.filter((s) => !known.has(s.id));
  } catch {
    return [];
  }
}

function matchWatches(stories, watches) {
  const matched = new Map();
  for (const story of stories) {
    const text = `${story.headline || ''} ${story.dek || ''} ${(story.topics || []).join(' ')}`.toLowerCase();
    for (const kw of watches) {
      if (text.includes(kw)) {
        matched.set(kw, (matched.get(kw) || 0) + 1);
      }
    }
  }
  return Array.from(matched.entries()).map(([keyword, count]) => ({ keyword, count }));
}

function pollForUpdates() {
  let knownLastUpdated = null;
  async function check() {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.lastUpdated) return;
      if (knownLastUpdated === null) { knownLastUpdated = data.lastUpdated; return; }
      if (data.lastUpdated !== knownLastUpdated) {
        knownLastUpdated = data.lastUpdated;
        let matchInfo = null;
        const watches = getWatches();
        if (watches.length) {
          try {
            const feedRes = await fetch('/api/feed');
            const feed = await feedRes.json();
            const newStories = getNewStories(feed.stories || []);
            if (newStories.length) {
              const matches = matchWatches(newStories, watches);
              if (matches.length) matchInfo = { matches, total: newStories.length };
            }
          } catch { /* non-critical */ }
        }
        showLiveUpdateBanner(data.lastUpdated, matchInfo);
      }
    } catch { /* silent */ }
  }
  check();
  setInterval(check, 5 * 60 * 1000);
}

function showLiveUpdateBanner(lastUpdated, matchInfo = null) {
  const banner = document.getElementById('liveUpdateBanner');
  if (!banner) return;
  const time = new Date(lastUpdated).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  let label;
  if (matchInfo?.matches?.length) {
    const kwList = matchInfo.matches.map((m) => `"${m.keyword}" (${m.count})`).join(', ');
    label = `&#9679; ${matchInfo.total} new ${matchInfo.total === 1 ? 'story' : 'stories'} &mdash; Watch: ${kwList}`;
  } else {
    label = `&#9679; Updated ${time} &mdash; new stories available`;
  }
  banner.style.display = '';
  banner.innerHTML = `<span>${label}</span><button id="liveUpdateReload" class="story-btn active">Reload</button><button id="liveUpdateDismiss" class="story-btn" aria-label="Dismiss">&#10005;</button>`;
  document.getElementById('liveUpdateReload')?.addEventListener('click', async () => {
    banner.style.display = 'none';
    await loadAll();
  }, { once: true });
  document.getElementById('liveUpdateDismiss')?.addEventListener('click', () => {
    banner.style.display = 'none';
  }, { once: true });
}

function updateDateline() {
  const d = new Date();
  const opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  const el = document.getElementById('navDateline');
  if (el) el.textContent = d.toLocaleDateString('en-GB', opts).toUpperCase();
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');
}

function initLoader() {
  const creature = document.getElementById('loaderCreature');
  const depth = document.getElementById('loaderDepth');
  const bar = document.getElementById('loaderBar');
  if (!creature || !depth || !bar) return;
  const index = Math.floor(Math.random() * creatures.length);
  creature.textContent = creatures[index];
  depth.textContent = depths[index];
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      bar.style.width = '100%';
      setTimeout(() => hideLoader(), 400);
    } else {
      bar.style.width = `${progress}%`;
    }
  }, 200);
}

function initParticles() {
  const container = document.getElementById('depthParticles');
  if (!container) return;
  for (let i = 0; i < 15; i += 1) {
    const particle = document.createElement('div');
    particle.className = 'depth-particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100 + 100}%`;
    particle.style.animationDuration = `${12 + Math.random() * 20}s`;
    particle.style.animationDelay = `${-Math.random() * 20}s`;
    particle.style.background = Math.random() > 0.5 ? 'var(--accent-gold)' : 'var(--accent-teal)';
    particle.style.boxShadow = `0 0 4px ${Math.random() > 0.5 ? 'var(--accent-gold-glow)' : 'var(--accent-teal-glow)'}`;
    container.appendChild(particle);
  }
}

// ── Refresh: SSE-driven progress phases ───────────────────────────────────────

function runRefreshStream({ onPhase, onDone, onError }) {
  return new Promise((resolve) => {
    let settled = false;
    const admin = adminQuerySuffix();
    const es = new EventSource(`/api/refresh-stream?force=1${admin ? `&${admin}` : ''}`);

    const finish = (fn) => {
      if (settled) return;
      settled = true;
      es.close();
      fn().then(resolve).catch(resolve);
    };

    es.addEventListener('phase', (e) => {
      try { onPhase(JSON.parse(e.data)); } catch { /* skip */ }
    });

    es.addEventListener('done', (e) => {
      finish(async () => {
        try { await onDone(JSON.parse(e.data)); } catch { /* skip */ }
      });
    });

    es.addEventListener('error', (e) => {
      finish(async () => {
        let msg = 'Refresh failed';
        try { if (e.data) msg = JSON.parse(e.data).message || msg; } catch { /* skip */ }
        try { await onError(msg); } catch { /* skip */ }
      });
    });

    // Safety timeout — give up after 3 minutes
    setTimeout(() => {
      finish(async () => { try { await onError('Refresh timed out'); } catch { /* skip */ } });
    }, 180000);
  });
}

function showToast(message, duration = 4000) {
  let toast = document.getElementById('ucToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ucToast';
    toast.className = 'uc-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('visible'), duration);
}

function highlightNewCards(newIds) {
  const idSet = new Set(newIds);
  document.querySelectorAll('[data-story-id]').forEach((card) => {
    if (idSet.has(card.dataset.storyId)) {
      card.classList.add('story-card--just-added');
      setTimeout(() => card.classList.remove('story-card--just-added'), 4000);
    }
  });
}

function initRefreshButton() {
  if (!refreshButton) return;

  refreshButton.addEventListener('click', async () => {
    if (refreshButton.disabled) return;
    refreshButton.disabled = true;
    refreshButton.classList.add('refreshing');

    const prevIds = new Set((storeCache?.stories || []).map((s) => s.id));

    await runRefreshStream({
      onPhase: ({ message }) => {
        if (refreshStatus) refreshStatus.textContent = message;
      },
      onDone: async (result) => {
        invalidateFeedCache(); // ensure loadAll fetches fresh data, not stale cache
        await loadAll();
        const newIds = (storeCache?.stories || []).map((s) => s.id).filter((id) => !prevIds.has(id));
        if (result.outcome === 'no_new_items' || newIds.length === 0) {
          showToast('No new stories — all caught up.');
          if (refreshStatus) refreshStatus.textContent = 'All caught up';
        } else {
          const n = newIds.length;
          if (refreshStatus) refreshStatus.textContent = `${n} new ${n === 1 ? 'story' : 'stories'} added`;
          showToast(`${n} new ${n === 1 ? 'story' : 'stories'} added`);
          highlightNewCards(newIds);
        }
        refreshButton.disabled = false;
        refreshButton.classList.remove('refreshing');
        trackEvent('refresh_complete', { stories: result.stories || 0, runId: result.runId || null });
      },
      onError: async (msg) => {
        if (refreshStatus) refreshStatus.textContent = 'Refresh failed. Check connectivity.';
        showToast('Refresh failed — check source connectivity.');
        refreshButton.disabled = false;
        refreshButton.classList.remove('refreshing');
        trackEvent('refresh_failed');
      }
    });
  });
}

// Silent background auto-refresh every 30 minutes when tab is visible
function initAutoRefresh() {
  const AUTO_MS = 30 * 60 * 1000;
  setInterval(async () => {
    if (document.visibilityState !== 'visible') return;
    if (refreshButton?.disabled) return; // manual refresh in progress
    try {
      const res = await fetch('/api/status');
      if (!res.ok) return;
      const data = await res.json();
      // Only silently reload if the server has a newer update than what we rendered
      if (storeCache?.lastUpdated && data.lastUpdated && data.lastUpdated !== storeCache.lastUpdated) {
        await loadAll();
      }
    } catch { /* silent */ }
  }, AUTO_MS);
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function initMarketTiles() {
  document.querySelectorAll('.market-tile').forEach((tile) => {
    if (tile.dataset.wired === '1') return;
    tile.dataset.wired = '1';
    tile.addEventListener('click', () => {
      const panel = tile.querySelector('.market-intel-panel');
      if (!panel) return;
      const isOpen = panel.classList.toggle('open');
      tile.setAttribute('aria-expanded', String(isOpen));
    });
    tile.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        tile.click();
      }
    });
  });
}

function initDepthInteractions() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.querySelectorAll('.depth-tilt').forEach((node) => {
    if (node.dataset.tiltWired === '1') return;
    node.dataset.tiltWired = '1';
    node.addEventListener('pointermove', (event) => {
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = py * -6;
      const rotateY = px * 8;
      node.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      node.classList.add('is-hovering');
    });
    const reset = () => {
      node.style.transform = '';
      node.classList.remove('is-hovering');
    };
    node.addEventListener('pointerleave', reset);
    node.addEventListener('blur', reset, true);
  });

  const hero = document.querySelector('.hero-inner');
  if (hero && hero.dataset.depthWired !== '1') {
    hero.dataset.depthWired = '1';
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      hero.querySelectorAll('.hero-depth-layer').forEach((layer, index) => {
        const amount = (index + 1) * 10;
        layer.style.transform = `translate3d(${(x * amount).toFixed(2)}px, ${(y * amount * -0.8).toFixed(2)}px, 0)`;
      });
    });
    hero.addEventListener('pointerleave', () => {
      hero.querySelectorAll('.hero-depth-layer').forEach((layer) => {
        layer.style.transform = '';
      });
    });
  }
}

function initSearch() {
  initSearchFilter(({ query, tier, topic, source, from, to }) => {
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    document.querySelectorAll('.story-card').forEach((card) => {
      const text = card.textContent.toLowerCase();
      const matchesQuery = !query || text.includes(query.toLowerCase());
      const matchesTier = !tier || card.dataset.tier === tier;
      const matchesTopic = !topic || text.includes(topic.toLowerCase());
      const matchesSource = !source || text.includes(source.toLowerCase());
      const dateValue = card.dataset.date ? new Date(card.dataset.date) : null;
      const matchesFrom = !fromDate || (dateValue && dateValue >= fromDate);
      const matchesTo = !toDate || (dateValue && dateValue <= toDate);
      card.style.display = matchesQuery && matchesTier && matchesTopic && matchesSource && matchesFrom && matchesTo ? '' : 'none';
    });
  });
}

function initArchiveSearch() {
  const input = document.getElementById('archiveSearch');
  const topicSel = document.getElementById('archiveTopic');
  const tierSel = document.getElementById('archiveTier');
  if (!input) return;

  function applyArchiveFilters() {
    const q = input.value.toLowerCase().trim();
    const topic = topicSel ? topicSel.value.toLowerCase() : '';
    const tier = tierSel ? tierSel.value : '';
    document.querySelectorAll('.archive-grid-card').forEach((card) => {
      const textMatch = !q || (card.dataset.text || '').includes(q);
      const topicMatch = !topic || (card.dataset.topic || '').toLowerCase().includes(topic);
      const tierMatch = !tier || card.dataset.tier === tier;
      card.style.display = textMatch && topicMatch && tierMatch ? '' : 'none';
    });
    // Hide day sections where all cards are filtered out
    document.querySelectorAll('.archive-day-section').forEach((section) => {
      const visible = section.querySelectorAll('.archive-grid-card:not([style*="display: none"]):not([style*="display:none"])');
      section.style.display = visible.length ? '' : 'none';
    });
  }

  input.addEventListener('input', applyArchiveFilters);
  if (topicSel) topicSel.addEventListener('change', applyArchiveFilters);
  if (tierSel) tierSel.addEventListener('change', applyArchiveFilters);

  document.querySelectorAll('.archive-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.archive-filter').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      loadAndRenderArchive(btn.dataset.range || 'week');
    });
  });
}

function initGlobalSearchPanel() {
  initGlobalSearch(async (params) => {
    const res = await fetchSearch(params);
    renderGlobalSearchResults(res.results || [], { fromArchive: res.fromArchive });
  });
}

function initShareButtons() {
  document.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-share-story]');
    if (!btn) return;
    const slug = btn.dataset.shareStory;
    const title = btn.dataset.shareTitle || '';
    const url = slug ? `${window.location.origin}/story/${slug}` : window.location.href;
    await copyStoryLink(url, title);
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = original; }, 1800);
  }, { capture: false });
}

function initExportButtons() {
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-export-briefing]')) {
      if (storeCache) exportBriefing(storeCache);
    } else if (event.target.closest('[data-export-text]')) {
      if (storeCache) exportBriefingText(storeCache);
    }
  });
}

function handleBoot() {
  const boot = getBootData();
  if (boot.page === 'story' && boot.story) {
    renderStoryPage(boot.story);
    window.navigateTo('story');
    trackEvent('story_read', { id: boot.story.id, slug: boot.story.slug });
    applySaveFollowState();
  }
  if (boot.page === 'digest' && boot.digest) {
    renderDigestPage(boot.digest);
    window.navigateTo('digest');
    trackEvent('digest_view', { key: boot.digest.key || 'latest' });
  }
}

window.openStory = async (slug) => {
  const story = await fetchStory(slug);
  if (story?.story) {
    markAsRead(story.story.id);
    applyReadState();
    renderStoryPage(story.story);
    window.navigateTo('story');
    history.pushState({ story: slug }, '', `/story/${slug}`);
    trackEvent('story_read', { id: story.story.id, slug: story.story.slug });
    applySaveFollowState();
  }
};

window.openDigest = async (key = 'latest') => {
  const digest = await fetchDigest(key);
  if (digest?.digest) {
    renderDigestPage(digest.digest);
    window.navigateTo('digest');
    history.pushState({ digest: key }, '', `/digest/${key}`);
    trackEvent('digest_view', { key });
  }
};

initNavigation();
initRunSelector();
initTierTabs();
initTopicFilters();
initForms();
initCtas();
initSaveFollow();
initReaderMode();
initShortcuts();
initRefreshButton();
initSearch();
initArchiveSearch();
initArchiveWeekToggles();
initGlobalSearchPanel();
initMyTopicsFilter(() => storeCache);
initExportButtons();
initKeywordWatches();
initUnreadFilter();
initDarkMode();
initNavMore();
subscribeToFeedUpdates();
initScoringPanel();
initSourceManager();
updateDateline();
initLoader();
initParticles();
initDepthInteractions();
initMarketTiles();
handleBoot();
loadAll();
loadResources();
loadScoring();
loadSources();
pollForUpdates();
initAutoRefresh();
