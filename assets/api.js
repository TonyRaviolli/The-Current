// Stale-while-revalidate feed cache — serves last known store instantly on
// repeat calls; background-revalidates when data is older than FEED_SWR_TTL.
const FEED_SWR_TTL = 30_000; // 30 s
let _swrCache = { data: null, ts: 0, inflight: false };
const ADMIN_TOKEN_KEY = 'uc_admin_token';

export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setAdminToken(token) {
  try {
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
    else localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // ignore storage failures
  }
}

function withAdminHeaders(headers = {}) {
  const token = getAdminToken();
  return token ? { ...headers, 'x-admin-token': token } : headers;
}

export function adminQuerySuffix() {
  const token = getAdminToken();
  return token ? `admin_token=${encodeURIComponent(token)}` : '';
}

export function invalidateFeedCache() {
  _swrCache = { data: null, ts: 0, inflight: false };
}

export async function fetchFeed() {
  const now = Date.now();
  const age = now - _swrCache.ts;

  // Fresh cache — return immediately
  if (_swrCache.data && age < FEED_SWR_TTL) return _swrCache.data;

  // Stale cache — return stale data and revalidate in background
  if (_swrCache.data && !_swrCache.inflight) {
    _swrCache.inflight = true;
    fetch('/api/feed')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) _swrCache = { data, ts: Date.now(), inflight: false }; })
      .catch(() => { _swrCache.inflight = false; });
    return _swrCache.data;
  }

  // No cache — must wait for fresh data
  const res = await fetch('/api/feed');
  if (!res.ok) throw new Error('Failed to load feed');
  const data = await res.json();
  _swrCache = { data, ts: Date.now(), inflight: false };
  return data;
}

export async function runRefresh(options = {}) {
  const query = new URLSearchParams();
  if (options.force !== false) query.set('force', '1');
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`/api/refresh${suffix}`, {
    headers: withAdminHeaders()
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Refresh failed');
  return data;
}

export async function fetchResources() {
  const res = await fetch('/api/resources');
  if (!res.ok) throw new Error('Failed to load resources');
  return res.json();
}

export async function fetchSearch(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.tier) searchParams.set('tier', params.tier);
  if (params.topic) searchParams.set('topic', params.topic);
  if (params.source) searchParams.set('source', params.source);
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  const res = await fetch(`/api/search?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function fetchStory(slug) {
  const res = await fetch(`/api/story/${slug}`);
  if (!res.ok) throw new Error('Story not found');
  return res.json();
}

export async function fetchDigest(key = 'latest') {
  const res = await fetch(`/api/digest/${key}`);
  if (!res.ok) throw new Error('Digest not found');
  return res.json();
}

export async function submitForm(endpoint, payload) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function fetchSources() {
  const res = await fetch('/api/sources', {
    headers: withAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to load sources');
  return res.json();
}

export async function toggleSource(id) {
  const res = await fetch('/api/sources/toggle', {
    method: 'POST',
    headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ id })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Toggle failed');
  return data;
}

export async function addSource(payload) {
  const res = await fetch('/api/sources/add', {
    method: 'POST',
    headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Add failed');
  return data;
}

export async function deleteSource(id) {
  const res = await fetch(`/api/sources/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: withAdminHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Delete failed');
  return data;
}

export async function fetchScoring() {
  const res = await fetch('/api/scoring', {
    headers: withAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to load scoring config');
  return res.json();
}

export async function saveScoring(payload) {
  const res = await fetch('/api/scoring', {
    method: 'POST',
    headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Save failed');
  return data;
}

export async function trackEvent(name, metadata = {}) {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, metadata, ts: new Date().toISOString() })
    });
  } catch {
    // silent fail
  }
}
