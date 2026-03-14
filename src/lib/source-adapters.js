import { parseFeed } from './rss.js';
import { fetchTextWithCache, requestWithRetry } from './http.js';
import { normalizeUrl } from './normalize.js';
import { safeText } from './sanitize.js';

export async function fetchSourceItems(source, context) {
  const adapter = source.adapter || source.type || 'rss';
  if (adapter === 'whitehouse-archive') return fetchWhiteHouseArchive(source, context);
  if (adapter === 'federal-register-api') return fetchFederalRegisterApi(source, context);
  if (adapter === 'congress-bills-api') return fetchCongressBillsApi(source, context);
  if (adapter === 'govinfo-bills-api') return fetchGovInfoBillsApi(source, context);
  if (adapter === 'supreme-court-opinions') return fetchSupremeCourtOpinions(source, context);
  if (adapter === 'fema-openfema-api') return fetchOpenFemaDeclarations(source, context);
  return fetchRssSource(source, context);
}

async function fetchRssSource(source, { cache, config, force, healthStore }) {
  const response = await fetchTextWithCache({
    url: source.url,
    sourceId: source.id,
    cache,
    config,
    force,
    healthStore
  });

  if (response.status === 304 || response.status === 0) {
    return { ...response, items: [] };
  }

  const items = parseFeed(response.body).map((item) => ({
    title: item.title,
    summary: item.summary || '',
    link: item.link,
    published: item.published,
    imageUrl: item.imageUrl || null
  }));

  return { ...response, items };
}

async function fetchWhiteHouseArchive(source, { config }) {
  const pageCount = Math.max(1, Math.min(Number(source.historyPages || 3), 10));
  const allItems = [];
  let requests = 0;

  for (let page = 1; page <= pageCount; page++) {
    const url = new URL(source.url);
    if (page > 1) url.searchParams.set('paged', String(page));
    const response = await requestWithRetry(url.toString(), {
      timeoutMs: config.timeouts.requestMs,
      retries: config.retries.max,
      backoffMs: config.retries.backoffMs
    });
    requests += 1;
    if (response.status < 200 || response.status >= 400) {
      return { status: response.status, headers: response.headers, body: response.body.toString('utf8'), items: [], requests };
    }
    allItems.push(...parseWhiteHouseArchive(response.body.toString('utf8')));
  }

  return { status: 200, headers: {}, body: '', items: dedupeItems(allItems), requests };
}

async function fetchFederalRegisterApi(source, { config }) {
  const url = buildFederalRegisterUrl(source);
  const response = await requestWithRetry(url, {
    timeoutMs: config.timeouts.requestMs,
    retries: config.retries.max,
    backoffMs: config.retries.backoffMs
  });

  const body = response.body.toString('utf8');
  if (response.status < 200 || response.status >= 400) {
    return { status: response.status, headers: response.headers, body, items: [], requests: 1 };
  }

  let json;
  try {
    json = JSON.parse(body);
  } catch {
    return { status: 500, headers: response.headers, body, items: [], requests: 1 };
  }

  return {
    status: response.status,
    headers: response.headers,
    body,
    items: parseFederalRegisterDocuments(json),
    requests: 1
  };
}

async function fetchCongressBillsApi(source, { config }) {
  const url = buildCongressBillsUrl(source);
  const response = await requestWithRetry(url, {
    timeoutMs: config.timeouts.requestMs,
    retries: config.retries.max,
    backoffMs: config.retries.backoffMs
  });
  const body = response.body.toString('utf8');
  if (response.status < 200 || response.status >= 400) {
    return { status: response.status, headers: response.headers, body, items: [], requests: 1 };
  }

  let json;
  try {
    json = JSON.parse(body);
  } catch {
    return { status: 500, headers: response.headers, body, items: [], requests: 1 };
  }

  return {
    status: response.status,
    headers: response.headers,
    body,
    items: parseCongressBills(json),
    requests: 1
  };
}

async function fetchGovInfoBillsApi(source, { config }) {
  const url = buildGovInfoBillsCollectionUrl(source);
  const response = await requestWithRetry(url, {
    timeoutMs: config.timeouts.requestMs,
    retries: config.retries.max,
    backoffMs: config.retries.backoffMs
  });
  const body = response.body.toString('utf8');
  if (response.status < 200 || response.status >= 400) {
    return { status: response.status, headers: response.headers, body, items: [], requests: 1 };
  }

  let json;
  try {
    json = JSON.parse(body);
  } catch {
    return { status: 500, headers: response.headers, body, items: [], requests: 1 };
  }

  const packages = Array.isArray(json.packages) ? json.packages.slice(0, Math.max(5, Math.min(Number(source.summaryLimit || 12), 20))) : [];
  const summaryRequests = [];
  for (const pkg of packages) {
    if (!pkg.packageLink) continue;
    const summaryUrl = appendApiKey(pkg.packageLink, govInfoApiKey());
    summaryRequests.push(
      requestWithRetry(summaryUrl, {
        timeoutMs: config.timeouts.requestMs,
        retries: config.retries.max,
        backoffMs: config.retries.backoffMs
      }).then((res) => {
        if (res.status < 200 || res.status >= 400) return null;
        try {
          return JSON.parse(res.body.toString('utf8'));
        } catch {
          return null;
        }
      }).catch(() => null)
    );
  }

  const summaries = (await Promise.all(summaryRequests)).filter(Boolean);
  return {
    status: response.status,
    headers: response.headers,
    body,
    items: parseGovInfoBillSummaries(summaries),
    requests: 1 + summaryRequests.length
  };
}

async function fetchSupremeCourtOpinions(source, { config }) {
  const terms = Array.isArray(source.terms) && source.terms.length ? source.terms : [currentSupremeCourtTerm(), currentSupremeCourtTerm() - 1];
  const requests = [];
  for (const term of terms.slice(0, 2)) {
    requests.push(
      requestWithRetry(buildSupremeCourtOpinionsUrl(term), {
        timeoutMs: config.timeouts.requestMs,
        retries: config.retries.max,
        backoffMs: config.retries.backoffMs
      }).then((res) => ({ term, res })).catch(() => ({ term, res: null }))
    );
  }
  const responses = await Promise.all(requests);
  const items = [];
  for (const entry of responses) {
    if (!entry.res || entry.res.status < 200 || entry.res.status >= 400) continue;
    items.push(...parseSupremeCourtOpinions(entry.res.body.toString('utf8')));
  }
  return { status: items.length ? 200 : 500, headers: {}, body: '', items: dedupeItems(items), requests: requests.length };
}

async function fetchOpenFemaDeclarations(source, { config }) {
  const url = buildOpenFemaUrl(source);
  const response = await requestWithRetry(url, {
    timeoutMs: config.timeouts.requestMs,
    retries: config.retries.max,
    backoffMs: config.retries.backoffMs
  });
  const body = response.body.toString('utf8');
  if (response.status < 200 || response.status >= 400) {
    return { status: response.status, headers: response.headers, body, items: [], requests: 1 };
  }

  let json;
  try {
    json = JSON.parse(body);
  } catch {
    return { status: 500, headers: response.headers, body, items: [], requests: 1 };
  }

  return {
    status: response.status,
    headers: response.headers,
    body,
    items: parseOpenFemaDeclarations(json),
    requests: 1
  };
}

export function parseWhiteHouseArchive(html = '') {
  const matches = [...html.matchAll(/##\s*<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]{0,220}?([A-Z][a-z]+ \d{1,2}, \d{4})/g)];
  return matches.map((match) => ({
    title: safeText(decodeHtml(match[2] || '')),
    summary: '',
    link: normalizeUrl(match[1]),
    published: parseUsDate(match[3]),
    imageUrl: null
  })).filter((item) => item.link && item.title);
}

export function parseFederalRegisterDocuments(payload = {}) {
  const results = Array.isArray(payload.results) ? payload.results : [];
  return results.map((item) => ({
    title: safeText(item.title || ''),
    summary: safeText(item.abstract || item.excerpts || ''),
    link: normalizeUrl(item.html_url || item.pdf_url || item.public_inspection_pdf_url || ''),
    published: item.publication_date ? new Date(item.publication_date).toISOString() : null,
    imageUrl: null
  })).filter((item) => item.link && item.title);
}

export function parseCongressBills(payload = {}) {
  const items = Array.isArray(payload.bills) ? payload.bills : Array.isArray(payload.data?.bills) ? payload.data.bills : [];
  return items.map((bill) => {
    const congress = bill.congress || bill.congressNumber || '';
    const type = String(bill.type || bill.billType || '').toLowerCase();
    const number = bill.number || bill.billNumber || '';
    const title = safeText(bill.title || bill.latestTitle || `${type.toUpperCase()} ${number}`);
    const latestAction = bill.latestAction?.text || bill.latestAction?.action || bill.latestAction?.description || '';
    const actionDate = bill.latestAction?.actionDate || bill.updateDate || bill.updatedAt || null;
    return {
      title,
      summary: safeText(latestAction),
      link: normalizeUrl(bill.url || buildCongressBillUrl(congress, type, number)),
      published: actionDate ? new Date(actionDate).toISOString() : null,
      imageUrl: null
    };
  }).filter((item) => item.link && item.title);
}

export function parseGovInfoBillSummaries(summaries = []) {
  return summaries.map((summary) => ({
    title: safeText(summary.title || summary.packageId || ''),
    summary: safeText(summary.branch ? `${summary.branch} · ${summary.documentType || ''}` : summary.documentType || ''),
    link: normalizeUrl(summary.detailsLink || summary.download?.pdfLink || ''),
    published: summary.dateIssued ? new Date(summary.dateIssued).toISOString() : null,
    imageUrl: null
  })).filter((item) => item.link && item.title);
}

export function parseSupremeCourtOpinions(html = '') {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
  return rows.map((match) => {
    const row = match[1] || '';
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => cell[1].replace(/<[^>]+>/g, ' ').trim());
    const linkMatch = row.match(/<a[^>]+href="([^"]+\.pdf)"[^>]*>([^<]+)<\/a>/i);
    if (!linkMatch) return null;
    return {
      title: safeText(decodeHtml(linkMatch[2] || cells[2] || 'Supreme Court opinion')),
      summary: safeText(cells[1] ? `Docket ${decodeHtml(cells[1])}` : ''),
      link: normalizeUrl(absoluteSupremeCourtUrl(linkMatch[1])),
      published: parseSupremeCourtDate(cells[0]),
      imageUrl: null
    };
  }).filter(Boolean).filter((item) => item.link && item.title).map((item) => ({
    title: item.title,
    summary: item.summary,
    link: item.link,
    published: item.published,
    imageUrl: null
  }));
}

export function parseOpenFemaDeclarations(payload = {}) {
  const items = Array.isArray(payload.DisasterDeclarationsSummaries) ? payload.DisasterDeclarationsSummaries
    : Array.isArray(payload.FemaWebDisasterDeclarations) ? payload.FemaWebDisasterDeclarations
    : Array.isArray(payload.results) ? payload.results
    : [];
  return items.map((item) => {
    const title = safeText(
      item.declarationTitle
      || item.title
      || [item.state, item.incidentType, item.declarationType].filter(Boolean).join(' ')
      || item.disasterName
    );
    const summary = safeText(
      item.incidentType && item.declarationType
        ? `${item.incidentType} · ${item.declarationType}`
        : item.incidentType || item.declarationType || ''
    );
    return {
      title,
      summary,
      link: normalizeUrl(item.disasterPageUrl || item.disasterUrl || buildFemaDisasterUrl(item.disasterNumber || item.femaDeclarationString || '')),
      published: item.declarationDate ? new Date(item.declarationDate).toISOString() : null,
      imageUrl: null
    };
  }).filter((item) => item.link && item.title);
}

function buildFederalRegisterUrl(source = {}) {
  const endpoint = source.url || 'https://www.federalregister.gov/api/v1/documents.json';
  const url = new URL(endpoint);
  const days = Math.max(7, Math.min(Number(source.apiDays || 30), 365));
  const start = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

  url.searchParams.set('per_page', String(Math.max(20, Math.min(Number(source.perPage || 100), 1000))));
  url.searchParams.set('order', 'newest');
  url.searchParams.set('conditions[publication_date][gte]', start);
  url.searchParams.set('conditions[term]', source.query || 'executive order OR proposed rule OR rule OR notice');

  for (const type of source.documentTypes || ['RULE', 'PRORULE', 'NOTICE', 'PRESDOCU']) {
    url.searchParams.append('conditions[type][]', type);
  }

  return url.toString();
}

function buildCongressBillsUrl(source = {}) {
  const url = new URL(source.url || 'https://api.congress.gov/v3/bill');
  const days = Math.max(7, Math.min(Number(source.apiDays || 30), 365));
  const start = new Date(Date.now() - days * 86400000).toISOString();
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(Math.max(20, Math.min(Number(source.limit || 100), 250))));
  url.searchParams.set('fromDateTime', start);
  url.searchParams.set('sort', 'updateDate+desc');
  url.searchParams.set('api_key', congressApiKey());
  return url.toString();
}

function buildGovInfoBillsCollectionUrl(source = {}) {
  const days = Math.max(7, Math.min(Number(source.apiDays || 30), 365));
  const start = new Date(Date.now() - days * 86400000).toISOString();
  const url = new URL(source.url || `https://api.govinfo.gov/collections/BILLS/${start}`);
  url.searchParams.set('pageSize', String(Math.max(10, Math.min(Number(source.pageSize || 25), 100))));
  url.searchParams.set('offsetMark', '*');
  url.searchParams.set('api_key', govInfoApiKey());
  return url.toString();
}

function buildSupremeCourtOpinionsUrl(term) {
  return `https://www.supremecourt.gov/opinions/slipopinion/${term}`;
}

function buildOpenFemaUrl(source = {}) {
  const url = new URL(source.url || 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries');
  const days = Math.max(7, Math.min(Number(source.apiDays || 30), 365));
  const start = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  url.searchParams.set('$orderby', 'declarationDate desc');
  url.searchParams.set('$top', String(Math.max(10, Math.min(Number(source.limit || 50), 100))));
  url.searchParams.set('$filter', `declarationDate ge '${start}'`);
  return url.toString();
}

function buildCongressBillUrl(congress, type, number) {
  if (!congress || !type || !number) return '';
  const typeSlug = String(type).replace(/\./g, '').toLowerCase();
  return `https://www.congress.gov/bill/${congress}th-congress/${typeSlug}-bill/${number}`;
}

function buildFemaDisasterUrl(value = '') {
  const cleaned = String(value).trim();
  if (!cleaned) return 'https://www.fema.gov/disaster/declarations';
  return `https://www.fema.gov/disaster/${cleaned.replace(/[^\w-]/g, '')}`;
}

function absoluteSupremeCourtUrl(path = '') {
  if (/^https?:\/\//i.test(path)) return path;
  return `https://www.supremecourt.gov${path.startsWith('/') ? '' : '/'}${path}`;
}

function parseSupremeCourtDate(value = '') {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function currentSupremeCourtTerm() {
  const now = new Date();
  const year = now.getUTCFullYear();
  return String(now.getUTCMonth() >= 9 ? year : year - 1).slice(-2);
}

function congressApiKey() {
  return process.env.CONGRESS_API_KEY || process.env.API_DATA_GOV_KEY || 'DEMO_KEY';
}

function govInfoApiKey() {
  return process.env.GOVINFO_API_KEY || process.env.API_DATA_GOV_KEY || 'DEMO_KEY';
}

function appendApiKey(url, apiKey) {
  const next = new URL(url);
  next.searchParams.set('api_key', apiKey);
  return next.toString();
}

function dedupeItems(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.link}::${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseUsDate(value = '') {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function decodeHtml(text = '') {
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&nbsp;/g, ' ');
}
