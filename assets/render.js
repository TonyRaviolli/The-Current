// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  render.js — The UnderCurrent DOM Rendering Module                     ║
// ╠══════════════════════════════════════════════════════════════════════════╣
// ║                                                                        ║
// ║  TABLE OF CONTENTS                                                     ║
// ║                                                                        ║
// ║   §1  CONSTANTS & PALETTES ........... Feed caps, topic visuals/labels ║
// ║   §2  SHARED UTILITIES ............... escapeHtml, formatDate, helpers  ║
// ║   §3  SVG FALLBACK SYSTEM ............ Topic icons, scene SVGs, cache  ║
// ║   §4  SCORE BADGES & CARD HELPERS .... Score labels, badges, actions   ║
// ║   §5  HOME — UPPER MODULES .......... MetaRibbon → TopicBlocks        ║
// ║   §6  HOME — DAILY FEED ............. Feed rendering + reconciliation  ║
// ║   §7  HOME — MARKET & SIDEBAR ....... MarketIntel, Heatmap, Spectrum  ║
// ║   §8  TOPICS TAB .................... Full topic section renderer      ║
// ║   §9  SECONDARY PAGES ............... About, Digest, Ops, Sources     ║
// ║  §10  SEARCH & STORY DETAIL ......... Global search, story page       ║
// ║  §11  ARCHIVE TAB ................... Date-grouped archive renderer    ║
// ║  §12  ADMIN & SEO ................... Scoring panel, JSON-LD          ║
// ║                                                                        ║
// ╚══════════════════════════════════════════════════════════════════════════╝


// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §1  CONSTANTS & PALETTES                                              ║
// ║  Feed display caps, topic color palettes, and label maps               ║
// ╚══════════════════════════════════════════════════════════════════════════╝

import { US_STATES } from './us-states.js';

// ── Feed size caps (adjust here to change across all tier sections) ───────────
const FEED_MAX_STORIES = 10; // total articles shown across Tier 1/2/3 on briefing tab
const FEED_MAX_PER_TIER = 3;  // target per tier before overflow fills remaining slots

// ── Topic-keyed visual palette for SVG placeholder images (OKLCH) ────────────
const TOPIC_VISUAL = {
  economy:      { bg: 'oklch(0.22 0.03 150)', accent: 'oklch(0.58 0.16 150)', icon: '$', label: 'Economy' },
  uspolitics:   { bg: 'oklch(0.22 0.03 280)', accent: 'oklch(0.58 0.18 280)', icon: '\u2696', label: 'U.S. Politics' },
  geopolitics:  { bg: 'oklch(0.22 0.03 230)', accent: 'oklch(0.58 0.14 230)', icon: '\u2316', label: 'Geopolitics' },
  tech:         { bg: 'oklch(0.22 0.03 290)', accent: 'oklch(0.58 0.14 290)', icon: '\u2B21', label: 'Technology' },
  defense:      { bg: 'oklch(0.22 0.02 80)',  accent: 'oklch(0.58 0.16 80)',  icon: '\u25C8', label: 'Defense' },
  health:       { bg: 'oklch(0.22 0.03 165)', accent: 'oklch(0.58 0.13 165)', icon: '+', label: 'Health' },
  law:          { bg: 'oklch(0.22 0.03 50)',  accent: 'oklch(0.58 0.16 50)',  icon: '\u2696', label: 'Law' },
  finance:      { bg: 'oklch(0.22 0.03 230)', accent: 'oklch(0.58 0.14 230)', icon: '\u25C6', label: 'Finance' },
  global_trade: { bg: 'oklch(0.22 0.03 320)', accent: 'oklch(0.58 0.15 320)', icon: '\u2295', label: 'Trade' },
  elections:    { bg: 'oklch(0.22 0.03 27)',  accent: 'oklch(0.58 0.20 27)',  icon: '\u2B21', label: 'Elections' },
  default:      { bg: 'oklch(0.22 0.01 250)', accent: 'oklch(0.50 0.01 250)', icon: '\u25C9', label: 'Intelligence' },
};

// ── OKLCH color palette for topic accents (L≈0.58, perceptually balanced) ────
export const TOPIC_PASTEL = {
  economy:      'oklch(0.58 0.16 150)',
  uspolitics:   'oklch(0.58 0.18 280)',
  geopolitics:  'oklch(0.58 0.14 230)',
  tech:         'oklch(0.58 0.14 290)',
  defense:      'oklch(0.58 0.16 80)',
  health:       'oklch(0.58 0.13 165)',
  law:          'oklch(0.58 0.16 50)',
  finance:      'oklch(0.58 0.14 230)',
  global_trade: 'oklch(0.58 0.15 320)',
  elections:    'oklch(0.58 0.20 27)',
  ai:           'oklch(0.58 0.18 300)',
  biotech:      'oklch(0.58 0.14 160)',
  housing:      'oklch(0.58 0.14 65)',
  labor:        'oklch(0.58 0.14 130)',
  climate:      'oklch(0.58 0.12 175)',
  energy:       'oklch(0.58 0.15 90)',
  science:      'oklch(0.58 0.16 250)',
  education:    'oklch(0.58 0.18 340)',
  banking:      'oklch(0.58 0.12 240)',
  international:'oklch(0.58 0.16 300)',
  cyber:        'oklch(0.58 0.20 355)',
  macroeconomics:'oklch(0.58 0.14 155)',
};

export const TOPIC_LABELS = { economy:'Economy',uspolitics:'U.S. Politics',geopolitics:'Geopolitics',tech:'Technology',defense:'Defense',health:'Health',law:'Law',finance:'Finance',global_trade:'Trade',elections:'Elections',ai:'AI',biotech:'Biotech',housing:'Housing',labor:'Labor',climate:'Climate',energy:'Energy',science:'Science',education:'Education',banking:'Banking',international:'International',cyber:'Cyber',macroeconomics:'Macroeconomics' };

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §2  SHARED UTILITIES                                                  ║
// ║  Text escaping, date formatting, topic degree computation              ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/** Compute topic → story count from a story array. Cached result can be passed to multiple renderers. */
export function computeTopicDegrees(stories) {
  const degrees = {};
  (stories || []).forEach((s) => (s.topics || []).forEach((t) => { degrees[t] = (degrees[t] || 0) + 1; }));
  return degrees;
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return '#';
  return escapeHtml(url);
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

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §3  SVG FALLBACK SYSTEM                                               ║
// ║  Topic-keyed icons, illustrated scene SVGs, data URI cache             ║
// ╚══════════════════════════════════════════════════════════════════════════╝

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

// ── V2 illustrated scene SVG builder ─────────────────────────────────────────
// Each topic gets a purpose-built multi-element scene with layered depth.
const TOPIC_SCENE = {
  economy: (a) => `<polyline points="40,160 80,130 120,145 170,95 220,110 270,60 320,80 370,40" fill="none" stroke="${a}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/><circle cx="370" cy="40" r="5" fill="${a}" opacity="0.6"/><circle cx="270" cy="60" r="3" fill="${a}" opacity="0.4"/><rect x="50" y="165" width="18" height="30" rx="2" fill="${a}" opacity="0.12"/><rect x="80" y="155" width="18" height="40" rx="2" fill="${a}" opacity="0.15"/><rect x="110" y="148" width="18" height="47" rx="2" fill="${a}" opacity="0.18"/><rect x="140" y="135" width="18" height="60" rx="2" fill="${a}" opacity="0.22"/><text x="200" y="205" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="${a}" opacity="0.25">$</text>`,
  finance: (a) => `<polyline points="30,150 80,120 130,140 180,80 240,100 300,55 360,70" fill="none" stroke="${a}" stroke-width="2" stroke-linecap="round" opacity="0.5"/><circle cx="360" cy="70" r="4" fill="${a}" opacity="0.5"/><path d="M180 80 L240 100 L240 195 L180 195 Z" fill="${a}" opacity="0.06"/><line x1="50" y1="195" x2="380" y2="195" stroke="${a}" stroke-width="1" opacity="0.15"/><line x1="50" y1="155" x2="380" y2="155" stroke="${a}" stroke-width="0.5" stroke-dasharray="4 4" opacity="0.1"/>`,
  uspolitics: (a) => `<rect x="170" y="50" width="60" height="90" rx="4" fill="${a}" opacity="0.08"/><rect x="180" y="36" width="40" height="18" rx="3" fill="${a}" opacity="0.12"/><line x1="200" y1="54" x2="200" y2="136" stroke="${a}" stroke-width="1.5" opacity="0.2"/><circle cx="200" cy="90" r="16" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.25"/><line x1="160" y1="140" x2="240" y2="140" stroke="${a}" stroke-width="2" opacity="0.2"/><line x1="155" y1="148" x2="245" y2="148" stroke="${a}" stroke-width="1" opacity="0.12"/><circle cx="120" cy="100" r="22" fill="none" stroke="${a}" stroke-width="1" opacity="0.1"/><circle cx="280" cy="100" r="22" fill="none" stroke="${a}" stroke-width="1" opacity="0.1"/>`,
  geopolitics: (a) => `<circle cx="200" cy="105" r="55" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.3"/><ellipse cx="200" cy="105" rx="28" ry="55" fill="none" stroke="${a}" stroke-width="1" opacity="0.2"/><line x1="145" y1="85" x2="255" y2="85" stroke="${a}" stroke-width="0.8" opacity="0.15"/><line x1="145" y1="105" x2="255" y2="105" stroke="${a}" stroke-width="0.8" opacity="0.18"/><line x1="145" y1="125" x2="255" y2="125" stroke="${a}" stroke-width="0.8" opacity="0.15"/><circle cx="230" cy="75" r="3" fill="${a}" opacity="0.35"/><circle cx="170" cy="115" r="2.5" fill="${a}" opacity="0.3"/><path d="M310 160 L340 140 L370 155 L345 170 Z" fill="${a}" opacity="0.08"/>`,
  tech: (a) => `<rect x="150" y="60" width="100" height="100" rx="12" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.22"/><circle cx="200" cy="110" r="22" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.25"/><circle cx="200" cy="110" r="8" fill="${a}" opacity="0.12"/><line x1="200" y1="60" x2="200" y2="86" stroke="${a}" stroke-width="1.5" opacity="0.2"/><line x1="200" y1="134" x2="200" y2="160" stroke="${a}" stroke-width="1.5" opacity="0.2"/><line x1="150" y1="110" x2="176" y2="110" stroke="${a}" stroke-width="1.5" opacity="0.2"/><line x1="224" y1="110" x2="250" y2="110" stroke="${a}" stroke-width="1.5" opacity="0.2"/><rect x="80" y="90" width="30" height="20" rx="3" fill="${a}" opacity="0.06"/><line x1="110" y1="100" x2="150" y2="110" stroke="${a}" stroke-width="1" opacity="0.1"/><rect x="290" y="100" width="30" height="20" rx="3" fill="${a}" opacity="0.06"/><line x1="250" y1="110" x2="290" y2="110" stroke="${a}" stroke-width="1" opacity="0.1"/>`,
  defense: (a) => `<polygon points="200,50 230,90 260,130 200,115 140,130 170,90" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.2"/><circle cx="200" cy="95" r="18" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.25"/><line x1="200" y1="77" x2="200" y2="113" stroke="${a}" stroke-width="1" opacity="0.2"/><line x1="182" y1="95" x2="218" y2="95" stroke="${a}" stroke-width="1" opacity="0.2"/><line x1="140" y1="160" x2="260" y2="160" stroke="${a}" stroke-width="2" opacity="0.15"/><rect x="160" y="140" width="80" height="20" rx="3" fill="${a}" opacity="0.06"/>`,
  health: (a) => `<line x1="200" y1="50" x2="200" y2="170" stroke="${a}" stroke-width="4" stroke-linecap="round" opacity="0.22"/><line x1="140" y1="110" x2="260" y2="110" stroke="${a}" stroke-width="4" stroke-linecap="round" opacity="0.22"/><circle cx="200" cy="110" r="40" fill="none" stroke="${a}" stroke-width="1" stroke-dasharray="6 4" opacity="0.12"/><circle cx="200" cy="110" r="55" fill="none" stroke="${a}" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.08"/><polyline points="120,180 150,180 165,165 175,190 190,160 200,180 280,180" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.2"/>`,
  law: (a) => `<line x1="200" y1="45" x2="200" y2="160" stroke="${a}" stroke-width="2" stroke-linecap="round" opacity="0.22"/><line x1="140" y1="85" x2="260" y2="85" stroke="${a}" stroke-width="2.5" opacity="0.2"/><circle cx="140" cy="85" r="14" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.2"/><circle cx="260" cy="85" r="14" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.2"/><rect x="185" y="160" width="30" height="12" rx="2" fill="${a}" opacity="0.12"/><rect x="175" y="168" width="50" height="6" rx="2" fill="${a}" opacity="0.08"/>`,
  elections: (a) => `<rect x="80" y="130" width="32" height="55" rx="3" fill="${a}" opacity="0.15"/><rect x="130" y="95" width="32" height="90" rx="3" fill="${a}" opacity="0.2"/><rect x="180" y="110" width="32" height="75" rx="3" fill="${a}" opacity="0.17"/><rect x="230" y="70" width="32" height="115" rx="3" fill="${a}" opacity="0.25"/><rect x="280" y="100" width="32" height="85" rx="3" fill="${a}" opacity="0.18"/><line x1="70" y1="185" x2="330" y2="185" stroke="${a}" stroke-width="1.5" opacity="0.15"/><circle cx="96" cy="120" r="4" fill="${a}" opacity="0.3"/><circle cx="246" cy="60" r="4" fill="${a}" opacity="0.35"/>`,
  climate: (a) => `<path d="M200 55 L175 100 L190 100 L165 150 L210 105 L195 105 L220 55 Z" fill="none" stroke="${a}" stroke-width="1.5" stroke-linejoin="round" opacity="0.2"/><circle cx="140" cy="70" r="20" fill="${a}" opacity="0.06"/><circle cx="155" cy="60" r="16" fill="${a}" opacity="0.06"/><circle cx="130" cy="62" r="14" fill="${a}" opacity="0.06"/><path d="M50 185 Q120 165 200 178 Q280 190 370 170" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.15"/>`,
  energy: (a) => `<path d="M200 50 L180 110 L192 110 L172 170 L230 100 L215 100 L240 50 Z" fill="${a}" opacity="0.1"/><path d="M200 50 L180 110 L192 110 L172 170 L230 100 L215 100 L240 50 Z" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.25"/><circle cx="310" cy="80" r="22" fill="none" stroke="${a}" stroke-width="1" opacity="0.12"/><line x1="310" y1="58" x2="310" y2="102" stroke="${a}" stroke-width="0.8" opacity="0.1"/><line x1="288" y1="80" x2="332" y2="80" stroke="${a}" stroke-width="0.8" opacity="0.1"/>`,
  science: (a) => `<circle cx="200" cy="105" r="18" fill="none" stroke="${a}" stroke-width="2" opacity="0.25"/><ellipse cx="200" cy="105" rx="48" ry="16" fill="none" stroke="${a}" stroke-width="1.2" opacity="0.18"/><ellipse cx="200" cy="105" rx="48" ry="16" fill="none" stroke="${a}" stroke-width="1.2" opacity="0.18" transform="rotate(60 200 105)"/><ellipse cx="200" cy="105" rx="48" ry="16" fill="none" stroke="${a}" stroke-width="1.2" opacity="0.18" transform="rotate(120 200 105)"/><circle cx="200" cy="105" r="4" fill="${a}" opacity="0.3"/>`,
  education: (a) => `<path d="M130 100 L200 65 L270 100 L200 135 Z" fill="none" stroke="${a}" stroke-width="1.5" stroke-linejoin="round" opacity="0.22"/><line x1="255" y1="108" x2="255" y2="155" stroke="${a}" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/><path d="M230 155 a28 10 0 0 1 50 0" fill="none" stroke="${a}" stroke-width="1.2" opacity="0.15"/><rect x="175" y="155" width="50" height="6" rx="2" fill="${a}" opacity="0.08"/>`,
  ai: (a) => `<circle cx="200" cy="95" r="24" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.25"/><circle cx="200" cy="95" r="8" fill="${a}" opacity="0.15"/><line x1="200" y1="119" x2="200" y2="155" stroke="${a}" stroke-width="1.5" opacity="0.2"/><line x1="176" y1="95" x2="145" y2="80" stroke="${a}" stroke-width="1" opacity="0.15"/><line x1="224" y1="95" x2="255" y2="80" stroke="${a}" stroke-width="1" opacity="0.15"/><circle cx="145" cy="80" r="6" fill="none" stroke="${a}" stroke-width="1" opacity="0.15"/><circle cx="255" cy="80" r="6" fill="none" stroke="${a}" stroke-width="1" opacity="0.15"/><line x1="176" y1="105" x2="145" y2="130" stroke="${a}" stroke-width="1" opacity="0.15"/><line x1="224" y1="105" x2="255" y2="130" stroke="${a}" stroke-width="1" opacity="0.15"/><circle cx="145" cy="130" r="6" fill="none" stroke="${a}" stroke-width="1" opacity="0.15"/><circle cx="255" cy="130" r="6" fill="none" stroke="${a}" stroke-width="1" opacity="0.15"/>`,
  default: (a) => `<path d="M60 120 Q110 90 160 120 Q210 150 260 120 Q310 90 360 120" fill="none" stroke="${a}" stroke-width="2.5" stroke-linecap="round" opacity="0.25"/><path d="M60 145 Q110 115 160 145 Q210 175 260 145 Q310 115 360 145" fill="none" stroke="${a}" stroke-width="1.5" stroke-linecap="round" opacity="0.12"/><circle cx="320" cy="70" r="3" fill="${a}" opacity="0.2"/><circle cx="80" cy="80" r="2" fill="${a}" opacity="0.15"/>`,
};

const _svgUriCache = new Map();
function renderStoryThumbFallbackDataUri(topics) {
  const t = (topics || []).map((x) => String(x).toLowerCase());
  const cacheKey = t.sort().join(',') || '__default__';
  if (_svgUriCache.has(cacheKey)) return _svgUriCache.get(cacheKey);
  let visual = TOPIC_VISUAL.default;
  for (const key of Object.keys(TOPIC_VISUAL)) {
    if (key !== 'default' && t.includes(key)) { visual = TOPIC_VISUAL[key]; break; }
  }
  const { bg, accent, label } = visual;
  // Pick the first matching scene, or default
  let sceneFn = TOPIC_SCENE.default;
  for (const key of Object.keys(TOPIC_SCENE)) {
    if (key !== 'default' && t.includes(key)) { sceneFn = TOPIC_SCENE[key]; break; }
  }
  const scene = sceneFn(accent);
  // Grid overlay for editorial feel
  const grid = `<line x1="0" y1="56" x2="400" y2="56" stroke="${accent}" stroke-width="0.4" opacity="0.06"/><line x1="0" y1="112" x2="400" y2="112" stroke="${accent}" stroke-width="0.4" opacity="0.06"/><line x1="0" y1="168" x2="400" y2="168" stroke="${accent}" stroke-width="0.4" opacity="0.06"/><line x1="100" y1="0" x2="100" y2="225" stroke="${accent}" stroke-width="0.4" opacity="0.04"/><line x1="200" y1="0" x2="200" y2="225" stroke="${accent}" stroke-width="0.4" opacity="0.04"/><line x1="300" y1="0" x2="300" y2="225" stroke="${accent}" stroke-width="0.4" opacity="0.04"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" width="800" height="450" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="rg" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/><stop offset="100%" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs><rect width="400" height="225" fill="${bg}"/><rect width="400" height="225" fill="url(#rg)"/>${grid}${scene}<text x="200" y="210" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="11" fill="${accent}" opacity="0.7" letter-spacing="3" font-weight="500">${label.toUpperCase()}</text></svg>`;
  let uri;
  try {
    uri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  } catch {
    uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  _svgUriCache.set(cacheKey, uri);
  return uri;
}

function renderStoryThumbFallback(className, topics) {
  const src = renderStoryThumbFallbackDataUri(topics);
  return `<figure class="${escapeHtml(className)} story-thumb--fallback" aria-hidden="true"><img src="${src}" alt="" loading="lazy" decoding="async" width="400" height="225"></figure>`;
}

/**
 * Attempt to upgrade an image URL to a higher resolution version.
 * Many CMS/CDN URLs contain resize parameters that cap the image at a
 * small thumbnail size. This function rewrites known patterns to request
 * a larger image so thumbnails and hero images appear crisp.
 */
function upgradeImageUrl(url) {
  if (!url) return url;
  let u = url;
  // WordPress/Jetpack: strip -NNxNN before extension (e.g. image-150x150.jpg → image.jpg)
  u = u.replace(/-\d{2,4}x\d{2,4}(\.\w{3,4}(?:[?#]|$))/, '$1');
  // Generic width/height query params: upgrade to 1200 wide
  u = u.replace(/([?&])w=\d+/i, '$1w=1200');
  u = u.replace(/([?&])width=\d+/i, '$1width=1200');
  u = u.replace(/([?&])h=\d+/i, '$1h=800');
  u = u.replace(/([?&])height=\d+/i, '$1height=800');
  // Cloudinary: /c_fill,w_NNN,h_NNN/ → /c_fill,w_1200,h_800/
  u = u.replace(/\/c_fill,w_\d+,h_\d+\//i, '/c_fill,w_1200,h_800/');
  // imgix: auto=format&w=NNN → auto=format&w=1200
  u = u.replace(/(auto=format[^&]*)&w=\d+/i, '$1&w=1200');
  return u;
}

/**
 * T8: Build a responsive <img> tag with lazy loading, decode hints,
 * explicit dimensions for CLS prevention, sizes for container-aware layout,
 * and fetchpriority for above-fold images.
 *
 * @param {string} src       - Image URL (already escaped/upgraded)
 * @param {string} alt       - Alt text (already escaped)
 * @param {object} opts
 * @param {string} opts.loading      - "lazy" (default) or "eager"
 * @param {string} opts.fetchpriority - "high", "low", or "" (omit)
 * @param {number} opts.width        - intrinsic width hint (default 400)
 * @param {number} opts.height       - intrinsic height hint (default 225)
 * @param {string} opts.sizes        - sizes attribute value
 * @param {string} opts.fallbackSrc  - onerror fallback data-URI
 */
function responsiveImg(src, alt, opts = {}) {
  const loading = opts.loading || 'lazy';
  const w = opts.width || 400;
  const h = opts.height || 225;
  const priority = opts.fetchpriority ? ` fetchpriority="${opts.fetchpriority}"` : '';
  const sizes = opts.sizes ? ` sizes="${escapeHtml(opts.sizes)}"` : '';
  const onerror = opts.fallbackSrc ? ` onerror="this.onerror=null;this.src='${opts.fallbackSrc.replace(/'/g, "\\'").replace(/"/g, '&quot;')}'"` : '';
  return `<img src="${src}" alt="${alt}" loading="${loading}" decoding="async" width="${w}" height="${h}"${priority}${sizes}${onerror}>`;
}

function renderStoryThumb(imageUrl, className, altText = '', topics = []) {
  const fallbackSrc = renderStoryThumbFallbackDataUri(topics);
  if (imageUrl) {
    const src = escapeHtml(upgradeImageUrl(imageUrl));
    const alt = escapeHtml(altText);
    // Determine dimensions and sizes by context
    let w = 400, h = 225, sizes = '(max-width:600px) 100vw, 400px';
    if (className === 'top3-thumb') { w = 600; h = 338; sizes = '(max-width:600px) 100vw, 33vw'; }
    else if (className === 'topic-story-thumb') { w = 80; h = 80; sizes = '80px'; }
    else if (className === 'archive-grid-thumb') { w = 400; h = 225; sizes = '(max-width:500px) 100vw, 50vw'; }
    const img = responsiveImg(src, alt, { width: w, height: h, sizes, fallbackSrc });
    return `<figure class="${escapeHtml(className)}">${img}</figure>`;
  }
  return renderStoryThumbFallback(className, topics);
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §4  SCORE BADGES & CARD HELPERS                                       ║
// ║  Score labels, confidence dots, badges, story actions, legislative      ║
// ╚══════════════════════════════════════════════════════════════════════════╝

function renderStoryActions(story, baseClass = 'topic-story-link') {
  const slug = escapeHtml(story.slug || '');
  const hasSlug = Boolean(story.slug);
  const external = story.url ? `<a class="${baseClass} secondary" href="${safeUrl(story.url)}" target="_blank" rel="noopener noreferrer">Source</a>` : '';
  const open = hasSlug
    ? `<a class="${baseClass}" href="/story/${slug}" data-open-story="${slug}">Open</a>`
    : (story.url ? `<a class="${baseClass}" href="${safeUrl(story.url)}" target="_blank" rel="noopener noreferrer">Open</a>` : '');
  return { open, external };
}

function scoreLabel(score) {
  if (typeof score !== 'number') return { value: '--', tier: 'Low', color: 'oklch(0.30 0.02 250)' };
  const value = (score * 10).toFixed(1);
  if (score >= 0.90) return { value, tier: 'Critical', color: 'oklch(0.55 0.22 27)' };
  if (score >= 0.78) return { value, tier: 'High',     color: 'oklch(0.60 0.18 50)' };
  if (score >= 0.65) return { value, tier: 'Notable',  color: 'oklch(0.75 0.16 90)' };
  if (score >= 0.50) return { value, tier: 'Standard', color: 'oklch(0.50 0.01 250)' };
  return { value, tier: 'Low', color: 'oklch(0.30 0.02 250)' };
}

function confidenceDots(sourceCount) {
  const n = typeof sourceCount === 'number' ? sourceCount : 1;
  const filled = Math.min(5, Math.max(1, n));
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="confidence-dot${i < filled ? ' filled' : ''}" aria-hidden="true"></span>`
  ).join('');
}

function scoreOutOfTen(score) {
  const { value } = scoreLabel(score);
  return value === '--' ? value : `${value}/10`;
}

function scoreBadgeHtml(score, sourceCount) {
  const s = scoreLabel(score);
  const tierClass = s.tier.toLowerCase();
  const dots = confidenceDots(sourceCount);
  return `<span class="score-badge score-badge--${tierClass}" style="border-left-color:${s.color};color:${s.color}">${scoreOutOfTen(score)} \u00B7 ${s.tier}<span class="confidence-dots" title="${sourceCount || 1} source${(sourceCount || 1) === 1 ? '' : 's'}">${dots}</span></span>`;
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

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §5  HOME — UPPER MODULES                                              ║
// ║  MetaRibbon, TodayBrief, Hero, TopStories, Developing, TopicBlocks,    ║
// ║  DailyInsight — rendered top-to-bottom on the Home (Briefing) tab      ║
// ╚══════════════════════════════════════════════════════════════════════════╝

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

export function renderHero(store, claimed) {
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

  // Priority bar for high-importance lead story
  const heroSection = headline.closest('.hero');
  const priorityBarSlot = document.getElementById('heroPriorityBar');
  const heroInner = headline.closest('.hero-inner');
  if (priorityBarSlot) priorityBarSlot.innerHTML = '';
  const existingChip = heroInner?.querySelector('.lead-score-chip');
  if (existingChip) existingChip.remove();
  const sl0 = scoreLabel(lead.score);
  if (lead.score >= 0.78 && heroSection) {
    const bar = document.createElement('div');
    bar.className = 'lead-priority-bar';
    bar.style.cssText = `background:linear-gradient(90deg,${sl0.color},transparent);`;
    if (priorityBarSlot) priorityBarSlot.appendChild(bar);
    const chip = document.createElement('div');
    chip.className = 'lead-score-chip';
    chip.innerHTML = `&#11014; ${escapeHtml(sl0.value)} \u00B7 ${escapeHtml(sl0.tier)}`;
    chip.style.cssText = `background:${sl0.color}22;color:${sl0.color};border-color:${sl0.color}44;`;
    heroInner.appendChild(chip);
  }
  headline.innerHTML = escapeHtml(lead.headline || lead.title);
  subhead.textContent = lead.dek || lead.summary || 'Briefing update ready.';
  meta.innerHTML = `<span class="hero-meta-dot"></span><span>${formatDate(lead.updatedAt || lead.publishedAt)}</span><span class="hero-meta-sep">&middot;</span>${scoreBadgeHtml(lead.score, lead.sources?.length)}`;
  let citationParts = '';
  if (lead.source) {
    let faviconHtml = '';
    if (lead.url) {
      try {
        const domain = new URL(lead.url).hostname;
        faviconHtml = `<img class="citation-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32" alt="" width="14" height="14" onerror="this.style.display='none'">`;
      } catch (_) { /* invalid URL — skip favicon */ }
    }
    citationParts += `<div class="citation-author">${faviconHtml}${escapeHtml(lead.source)}</div>`;
    citationParts += `<div class="citation-date">${formatDate(lead.updatedAt || lead.publishedAt)}</div>`;
  }
  if (lead.url) {
    let urlDisplay = escapeHtml(lead.url);
    try {
      const parsed = new URL(lead.url);
      const domain = escapeHtml(parsed.hostname);
      const pathPart = escapeHtml(parsed.pathname + parsed.search);
      urlDisplay = `<span class="citation-link-domain">${domain}</span><span class="citation-link-path">${pathPart}</span>`;
    } catch (_) { /* invalid URL — show raw */ }
    citationParts += `<div class="citation-link"><a href="${safeUrl(lead.url)}" target="_blank" rel="noopener noreferrer">${urlDisplay} <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 1h7v7M11 1L5 7"/></svg></a></div>`;
  }
  citation.innerHTML = citationParts;
  const heroThumb = document.getElementById('heroThumb');
  if (heroThumb) {
    const fallbackSrc = renderStoryThumbFallbackDataUri(lead.topics || []);
    if (lead.imageUrl) {
      const heroSrc = escapeHtml(upgradeImageUrl(lead.imageUrl));
      heroThumb.innerHTML = responsiveImg(heroSrc, escapeHtml(lead.headline || ''), {
        loading: 'eager', fetchpriority: 'high', width: 800, height: 600,
        sizes: '(max-width:640px) 100vw, (max-width:900px) 100vw, 48vw', fallbackSrc
      });
    } else {
      heroThumb.innerHTML = responsiveImg(fallbackSrc, '', { loading: 'eager', width: 800, height: 600 });
    }
  }
  if (claimed && lead.id) claimed.add(lead.id);
  renderArticleJsonLd(lead);
}

export function renderTopStories(store, claimed) {
  const container = document.getElementById('topStories');
  if (!container) return;
  // Pick top stories that haven't been claimed by a higher module (e.g. hero)
  const top = (store.stories || []).filter((s) => !claimed || !claimed.has(s.id)).slice(0, 3);
  if (!top.length) {
    container.innerHTML = '<div class=\"story-card\">No Top 3 stories yet. Refresh to populate prioritized intelligence.</div>';
    return;
  }
  top.forEach((s) => { if (claimed && s.id) claimed.add(s.id); });
  container.innerHTML = top.map((story, index) => {
    const thumb = renderStoryThumb(story.imageUrl, 'top3-thumb', '', story.topics);
    return `<div class="top3-card depth-tilt reveal ${index ? 'stagger-' + index : ''}">
      ${thumb}
      <span class="top3-rank">${String(index + 1).padStart(2, '0')}</span>
      <div class="top3-category" data-category="${escapeHtml(story.topics?.[0] || '')}">${escapeHtml(story.topics?.[0] || 'Priority')}</div>
      <h3 class="top3-title"><a href="/story/${escapeHtml(story.slug)}">${escapeHtml(story.headline)}</a></h3>
      <p class="top3-excerpt">${escapeHtml(story.dek || '')}</p>
      <div class="top3-score"><div class="top3-score-bar"><div class="top3-score-fill" style="width:${Math.round((story.score || 0) * 100)}%"></div></div>${scoreBadgeHtml(story.score, story.sources?.length)}</div>
      ${story.url ? `<a class="story-external-link" href="${safeUrl(story.url)}" target="_blank" rel="noopener noreferrer">Source Link</a>` : ''}
      <div class="citation"><div class="citation-author">${escapeHtml(story.sources?.[0]?.name || '')}</div><div class="citation-date">${formatDate(story.updatedAt)}</div></div>
    </div>`;
  }).join('');
}

export function renderDeveloping(store, claimed) {
  const container = document.getElementById('developingList');
  if (!container) return;
  const items = (store.stories || []).filter((story) => story.developing && (!claimed || !claimed.has(story.id))).slice(0, 6);
  if (!items.length) {
    container.innerHTML = '<div class=\"story-card\">No developing clusters are active right now.</div>';
    return;
  }
  items.forEach((s) => { if (claimed && s.id) claimed.add(s.id); });
  container.innerHTML = items.map((story) => {
    return `<div class="developing-card depth-tilt">
      <div class="developing-meta">${escapeHtml(story.verificationTier)} &middot; ${story.sources?.length || 0} sources</div>
      <div class="developing-title"><a href="/story/${escapeHtml(story.slug)}">${escapeHtml(story.headline)}</a></div>
      <div class="story-card-excerpt">${escapeHtml(story.dek || '')}</div>
      <div class="developing-actions">
        ${(story.topics || []).slice(0, 3).map((topic) => `<span class="developing-chip" data-category="${escapeHtml(topic)}">${escapeHtml(topic)}</span>`).join('')}
        ${story.url ? `<a class="story-external-link" href="${safeUrl(story.url)}" target="_blank" rel="noopener noreferrer">External</a>` : ''}
      </div>
    </div>`;
  }).join('');
}

export function renderTopicBlocks(store, claimed) {
  const container = document.getElementById('topicBlocks');
  if (!container) return;
  const blocks = store.topicBlocks || [];
  if (!blocks.length) {
    container.innerHTML = '<div class=\"story-card\">Topic blocks will appear after the next successful ingest run.</div>';
    return;
  }
  container.innerHTML = blocks.map((block) => {
    // Filter out stories already shown in higher-priority modules
    const filteredItems = claimed ? block.items.filter((item) => !claimed.has(item.id)) : block.items;
    if (!filteredItems.length) return '';
    return `<div class="topic-block-card depth-tilt">
      <div class="topic-block-title">${escapeHtml(block.label)}</div>
      <ul class="topic-block-list">
        ${filteredItems.map((item) => `<li class="topic-block-item"><a href="/story/${escapeHtml(item.slug)}">${escapeHtml(item.headline)}</a></li>`).join('')}
      </ul>
    </div>`;
  }).filter(Boolean).join('');
}

export function renderDailyInsight(store) {
  const text = document.getElementById('dailyInsightText');
  const source = document.getElementById('dailyInsightSource');
  if (!text || !source) return;
  text.textContent = store.quotes?.dailyInsight || 'Signal will appear after refresh.';
  source.textContent = `Source: ${store.quotes?.source || 'Original'}`;
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §6  HOME — DAILY FEED                                                 ║
// ║  Main story feed with tier capping, dedup, DOM reconciliation,         ║
// ║  topic breakdown strip, and since-last-visit banner                    ║
// ╚══════════════════════════════════════════════════════════════════════════╝

export function renderDailyFeed(store, saved = new Set(), followed = new Set(), lastVisitAt = null, claimed = null) {
  const list = document.getElementById('storyList');
  if (!list) return;
  const debug = new URLSearchParams(window.location.search).get('debug') === '1';
  const rawItems = store.stories || [];
  if (!rawItems.length) {
    list.innerHTML = '<article class=\"story-card\"><h3 class=\"story-card-title\">No stories ingested in this run</h3><p class=\"story-card-excerpt\">No new items from sources in this run. Try refresh again or review Archive for prior coverage.</p></article>';
    return { newCount: 0 };
  }

  // Exclude stories already claimed by higher-priority modules (hero, top3, developing)
  const unclaimed = claimed ? rawItems.filter((s) => !claimed.has(s.id)) : rawItems;

  // Relevance pre-filter: exclude foreign-local stories with no US angle.
  const LOCAL_ONLY_TOPICS = new Set(['local', 'housing', 'labor', 'education']);
  const relevantItems = unclaimed.filter((s) => {
    const topics = s.topics || [];
    if (!topics.length) return true;
    const allLocal = topics.every((t) => LOCAL_ONLY_TOPICS.has(t));
    if (!allLocal) return true;
    const regions = s.regions || [];
    return regions.some((r) => r === 'US' || String(r).startsWith('US-'));
  });

  // Cap feed: take up to FEED_MAX_PER_TIER from each tier, then fill remaining
  // slots from whichever tiers have surplus (highest-score first).
  const byTier = { 1: [], 2: [], 3: [] };
  for (const s of relevantItems) {
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
    const sl = scoreLabel(story.score);
    const breakdown = debug && story.scoreBreakdown ? `Score: ${sl.value} | tier ${story.scoreBreakdown.tierWeight.toFixed(2)} recency ${story.scoreBreakdown.recency.toFixed(2)}` : '';
    const topicsStr = (story.topics || []).join(',');
    const isNew = lastVisit && new Date(story.publishedAt) > lastVisit;
    const newBadge = isNew ? `<span class="story-new-badge" title="New since your last visit">NEW</span>` : '';

    const wordCount = ((story.headline || '') + ' ' + (story.dek || '') + ' ' + (story.summary || '')).split(/\s+/).filter(Boolean).length;
    const readTime = `${Math.max(1, Math.round(wordCount / 200))} min read`;

    const thumbHtml = renderStoryThumb(story.imageUrl, 'story-card-thumb', '', story.topics);

    const entityTags = [
      ...(story.entities?.tickers || []).map((t) => `<span class="entity-tag entity-ticker">${escapeHtml(t)}</span>`),
      ...(story.entities?.countries || []).slice(0, 2).map((c) => `<span class="entity-tag entity-country">${escapeHtml(c)}</span>`)
    ].join('');

    return `<article class="story-card depth-tilt reveal${isNew ? ' story-card--new' : ''} story-card--has-thumb" data-tier="${story.tier}" data-date="${story.updatedAt}" data-story-id="${escapeHtml(story.id)}" data-topic="${escapeHtml(story.topics?.[0] || '')}" data-topics="${escapeHtml(topicsStr)}">
      ${thumbHtml}
      <div class="story-card-header">
        ${newBadge}
        <span class="story-card-tier tier-${story.tier}">Tier ${story.tier}</span>
        ${scoreBadgeHtml(story.score, story.sources?.length)}
      </div>
      <h3 class="story-card-title"><a href="/story/${escapeHtml(story.slug)}" data-open-story="${escapeHtml(story.slug)}">${escapeHtml(story.headline)}</a></h3>
      <p class="story-card-excerpt">${escapeHtml(story.dek || '')}</p>
      ${entityTags ? `<div class="entity-tags">${entityTags}</div>` : ''}
      <div class="spectrum-mini">${(story.spectrum || []).map((row) => `<span style=\"width:${Number(row.percent)||0}%;background:${escapeHtml(row.color||'')}\"></span>`).join('')}</div>
      <div class="story-card-footer">
        <span class="story-card-source"><span class="source-dot center"></span> ${escapeHtml(story.sources?.[0]?.name || '')}</span>
        <span>&middot;</span>
        <span class="story-card-source">${formatDate(story.updatedAt)}</span>
        <span>&middot;</span><span class="story-read-time">${readTime}</span>
        ${story.url ? `<span>&middot;</span><a class="story-external-link" href="${safeUrl(story.url)}" target="_blank" rel="noopener noreferrer">Original</a>` : ''}
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

  return { newCount, items };
}

export function renderTopicBreakdownStrip(store, precomputedDegrees) {
  const target = document.getElementById('topicCountStrip');
  if (!target) return;
  const degrees = precomputedDegrees || computeTopicDegrees(store.stories);
  const totalMentions = Object.values(degrees).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(degrees).filter(([id, n]) => n > 0 && TOPIC_LABELS[id]).sort((a, b) => b[1] - a[1]);
  const maxCount = sorted.length ? sorted[0][1] : 1;
  const chips = sorted.map(([id, count]) => {
    const color = TOPIC_PASTEL[id] || 'oklch(0.50 0.01 250)';
    const pct = Math.round((count / totalMentions) * 100);
    const barWidth = Math.round((count / maxCount) * 100);
    return `<button class="topic-count-chip" data-topic="${escapeHtml(id)}" style="border-left-color:${color};--bar-fill:${barWidth}%;--bar-color:${color}" type="button">${escapeHtml(TOPIC_LABELS[id] || id)} <span class="topic-breakdown-count">${count}</span><span class="topic-breakdown-pct">${pct}%</span></button>`;
  });
  if (chips.length < 2) { target.style.display = 'none'; return; }
  target.style.display = '';
  target.innerHTML = chips.join('');
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

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §7  HOME — MARKET, SIDEBAR & BOTTOM MODULES                          ║
// ║  Market Intelligence card, Market Heatmap, Cartoons,                   ║
// ║  High Importance / Legislative, Source Spectrum sidebar                 ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/**
 * Render the AI-generated market intelligence card.
 * Visualises pulse, regime, summary, and signals as a styled panel with SVG accent.
 */
function signalSparkline(signals, regime) {
  if (!signals || !signals.length) return '';
  const regimeStrokeColors = {
    'risk-on':  'oklch(0.58 0.16 150)', 'risk-off': 'oklch(0.50 0.18 27)',
    'volatile': 'oklch(0.72 0.16 75)',  'stable':   'oklch(0.50 0.12 240)',
  };
  const color = regimeStrokeColors[(regime || 'stable').toLowerCase()] || 'oklch(0.50 0.12 240)';
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

  const pulseColors = { Volatile: 'oklch(0.55 0.18 27)', Active: 'oklch(0.65 0.14 75)', Stable: 'oklch(0.58 0.16 150)', Subdued: 'oklch(0.55 0.03 230)' };
  const regimeColors = { 'risk-on': 'oklch(0.58 0.16 150)', 'risk-off': 'oklch(0.55 0.18 27)', volatile: 'oklch(0.65 0.14 75)', stable: 'oklch(0.55 0.03 230)' };
  const regimeBgColors = {
    'risk-on':  'oklch(0.58 0.16 150 / 0.08)',
    'risk-off': 'oklch(0.50 0.18 27 / 0.08)',
    'volatile': 'oklch(0.72 0.16 75 / 0.08)',
    'stable':   'oklch(0.50 0.12 240 / 0.06)',
  };
  const pColor = pulseColors[intel.pulse] || 'oklch(0.55 0.03 230)';
  const rColor = regimeColors[intel.regime] || 'oklch(0.55 0.03 230)';
  const regime = (intel.regime || 'stable').toLowerCase();
  const tileBackground = regimeBgColors[regime] || regimeBgColors['stable'];

  const signals = (intel.signals || []).slice(0, 6);
  const sparkline = signalSparkline(signals, intel.regime);
  const signalLabel = signals[0] ? escapeHtml(signals[0].split(' ').slice(0, 3).join(' ')) : '';

  const signalItems = signals.slice(0, 3).map((s) =>
    `<li class="market-signal-item"><span class="market-signal-dot" style="--signal-color:${pColor}"></span>${escapeHtml(s)}</li>`
  ).join('');

  container.innerHTML = `
    <div class="market-intel-card" style="--regime-bg:${tileBackground};--pulse-color:${pColor};--regime-color:${rColor}">
      <div class="market-intel-header">
        <span class="market-intel-pulse">${escapeHtml(intel.pulse)}</span>
        <span class="market-intel-regime">${escapeHtml(intel.regime)}</span>
        <span class="market-intel-label">AI Market Read</span>
      </div>
      ${signalLabel ? `<div class="market-intel-signal-label">${signalLabel}</div>` : ''}
      ${sparkline}
      <p class="market-intel-summary">${escapeHtml(intel.summary || '')}</p>
      ${signalItems ? `<ul class="market-signal-list">${signalItems}</ul>` : ''}
    </div>`;

  // Also apply regime color to static market tiles
  document.querySelectorAll('.market-tile').forEach((tile) => {
    tile.style.background = tileBackground;
  });
}

export function renderMarketHeatmap(stories, container, precomputedDegrees) {
  if (!container) return;
  const sectors = [
    { id: 'economy',     label: 'Economy',    color: 'rgba(41,128,185,' },
    { id: 'finance',     label: 'Finance',    color: 'rgba(39,174,96,' },
    { id: 'tech',        label: 'Tech',       color: 'rgba(155,89,182,' },
    { id: 'defense',     label: 'Defense',    color: 'rgba(192,57,43,' },
    { id: 'global_trade',label: 'Trade',      color: 'rgba(243,156,18,' },
    { id: 'uspolitics',  label: 'Policy',     color: 'rgba(180,138,58,' },
  ];
  const degrees = precomputedDegrees || computeTopicDegrees(stories);
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

  function cartoonCard(story, variant = '') {
    const thumb = story.imageUrl
      ? `<figure class="cartoon-thumb">${responsiveImg(escapeHtml(story.imageUrl), escapeHtml(story.headline), { width: 300, height: 300, sizes: '(max-width:600px) 50vw, 200px' })}</figure>`
      : `<div class="cartoon-thumb cartoon-thumb--placeholder"><svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="24" cy="24" r="20"/><path d="M16 20c2-3 8-5 10 0s7 6 8 2"/><circle cx="18" cy="22" r="2" fill="currentColor"/><circle cx="30" cy="22" r="2" fill="currentColor"/><path d="M18 31c2 3 10 3 12 0"/></svg></div>`;
    return `<div class="cartoon-card${variant ? ' ' + variant : ' depth-tilt'}">
      ${thumb}
      <div class="cartoon-meta">
        <div class="cartoon-source">${escapeHtml(story.sources?.[0]?.name || '')}</div>
        <a class="cartoon-title" href="${safeUrl(story.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(story.headline)}</a>
      </div>
    </div>`;
  }

  if (container) container.innerHTML = items.map((s) => cartoonCard(s)).join('');
  if (rail) rail.innerHTML = items.slice(0, 3).map((s) => cartoonCard(s, 'cartoon-card--rail')).join('');
}

export function renderHighImportance(store, claimed) {
  const list = document.getElementById('highImportanceList');
  const section = document.getElementById('legisSection');
  if (!list) return;
  const pool = [...(store.highImportance || []), ...(store.stories || [])];
  const seen = new Set();
  const items = pool
    .filter((story) => story?.id && !seen.has(story.id) && (!claimed || !claimed.has(story.id)) && isLegislativeStory(story) && findGovernmentDoc(story) && seen.add(story.id))
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
        ? `<a class="legis-card-action legis-card-action--secondary" href="${storyUrl}" data-open-story="${escapeHtml(story.slug)}">Coverage</a>`
        : `<a class="legis-card-action legis-card-action--secondary" href="${storyUrl}" target="_blank" rel="noopener noreferrer">Coverage</a>`)
      : '';
    const docAction = primary?.url
      ? `<a class="legis-card-action" href="${safeUrl(primary.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(governmentDocLabel(primary))}</a>`
      : '';
    const sourceName = primary?.label || story.sources?.[0]?.name || story.source || '';
    const updated = formatDate(story.updatedAt || story.publishedAt);
    const topic = (story.topics?.[0] || 'legislation').replace(/_/g, ' ');
    return `<div class="legis-card">
      <div class="legis-card-top">
        <span class="legis-card-bill-num">${escapeHtml(String(bill).replace(/_/g, ' '))}</span>
        <span class="legis-card-score-badge">${scoreOutOfTen(story.score)}</span>
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

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §8  TOPICS TAB                                                        ║
// ║  Full topic section renderer with date groups, previews, expand/       ║
// ║  collapse, date navigation pills, cluster intros                       ║
// ╚══════════════════════════════════════════════════════════════════════════╝

export function renderTopics(store) {
  const container = document.getElementById('topicsContent');
  if (!container) return;
  const topics = store.topics || [];
  if (!topics.length) {
    container.innerHTML = '<div class="story-empty-state"><p>No topic clusters available yet. Trigger a refresh to generate category views.</p></div>';
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  container.innerHTML = topics.map((topic) => {
    const todayCount = topic.items.filter((story) => String(story.updatedAt || story.publishedAt || '').slice(0, 10) === today).length;
    const dateGroups = groupStoriesByDate(topic.items);
    const clusterIntro = (topic.items[0]?.whyItMatters || topic.items[0]?.whatsNext)
      ? `<div class="topic-cluster-intro">
          ${topic.items[0].whyItMatters ? `<p class="topic-cluster-lead">${escapeHtml(topic.items[0].whyItMatters)}</p>` : ''}
          ${topic.items[0].whatsNext ? `<p class="topic-cluster-watch"><strong>Watch for:</strong> ${escapeHtml(topic.items[0].whatsNext)}</p>` : ''}
          <span class="topic-story-count">${topic.items.length} stor${topic.items.length !== 1 ? 'ies' : 'y'}</span>
        </div>`
      : '';
    const groups = dateGroups.map((group, gi) => {
      const items = group.items.map((story) => {
        const storyDate = String(story.updatedAt || story.publishedAt || '').slice(0, 10);
        const storyTime = formatTime(story.updatedAt || story.publishedAt);
        const slug = escapeHtml(story.slug || '');
        const hasSlug = Boolean(story.slug);
        const { open, external } = renderStoryActions(story);
        const thumb = renderStoryThumb(story.imageUrl, 'topic-story-thumb', story.headline || story.title || '', story.topics);
        return `<article class="topic-story topic-story--has-thumb" data-story-date="${escapeHtml(storyDate)}">
          <div class="topic-story-score"><span class="topic-story-score-value">${scoreLabel(story.score).value}</span><span class="topic-story-score-scale">/10</span></div>
          ${thumb}
          <div class="topic-story-main">
            <div class="topic-story-head">
              <div class="topic-story-title">${hasSlug ? `<a href="/story/${slug}" data-open-story="${slug}">${escapeHtml(story.headline || story.title)}</a>` : escapeHtml(story.headline || story.title)}</div>
            </div>
            <div class="topic-story-excerpt">${escapeHtml(story.dek || story.summary || '')}</div>
            <div class="topic-story-footer">
              <div class="topic-story-info">${escapeHtml(story.sources?.[0]?.name || story.source || '')}${storyDate ? ` &middot; ${escapeHtml(formatDate(story.updatedAt || story.publishedAt))}` : ''}${storyTime ? ` &middot; ${escapeHtml(storyTime)}` : ''}</div>
              <div class="topic-story-actions">${open}${external}</div>
            </div>
          </div>
        </article>`;
      }).join('');
      return `<section class="topic-date-group${gi > 0 ? ' collapsed' : ''}" data-topic-date="${escapeHtml(group.date)}"><div class="topic-date-group-header" data-toggle-topic-group><span class="topic-date-group-title">${escapeHtml(group.label)}</span><span class="topic-date-group-meta">${group.items.length} stor${group.items.length === 1 ? 'y' : 'ies'}</span><span class="topic-date-group-toggle" aria-hidden="true">&#9662;</span></div>${items}</section>`;
    }).join('');
    const datePills = dateGroups.map((group, gi) => {
      const short = group.date && group.date !== 'unknown'
        ? new Date(group.date + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : group.label;
      return `<button class="topic-date-pill${gi === 0 ? ' active' : ''}" data-target-date="${escapeHtml(group.date || '')}" type="button">${escapeHtml(short)}</button>`;
    }).join('');
    const dateNav = dateGroups.length > 1
      ? `<div class="topic-date-nav" data-topic-nav="${escapeHtml(topic.topic)}"><button class="topic-date-nav-arrow" data-dir="left" type="button" aria-label="Scroll dates left">&#8249;</button><div class="topic-date-nav-strip">${datePills}</div><button class="topic-date-nav-arrow" data-dir="right" type="button" aria-label="Scroll dates right">&#8250;</button></div>`
      : '';

    const sectionColor = TOPIC_PASTEL[topic.topic] || 'oklch(0.50 0.01 250)';
    return `<div class="topic-section topic-section--collapsed" data-topic-section="${escapeHtml(topic.topic)}" style="border-left: 4px solid ${sectionColor}">
      <div class="topic-section-header">
        <h2 class="topic-section-title" style="color: ${sectionColor}">${escapeHtml(topic.label || topic.topic)}</h2>
        <span class="topic-section-meta">${todayCount ? `${todayCount} today` : 'No stories today'}</span>
      </div>
      ${clusterIntro}
      <div class="topic-preview">
        <ul class="topic-preview-list">
          ${topic.items.slice(0, 3).map((s) => `<li class="topic-preview-item"><a href="/story/${escapeHtml(s.slug || '')}" data-open-story="${escapeHtml(s.slug || '')}">${escapeHtml(s.headline || s.title || '')}</a><span class="topic-preview-source">${escapeHtml(s.sources?.[0]?.name || s.source || '')}</span></li>`).join('')}
        </ul>
        ${todayCount > 0 ? `<button class="topic-expand-btn" data-expand-topic="${escapeHtml(topic.topic)}" type="button">Browse all ${todayCount} stories \u2192</button>` : '<span class="topic-expand-empty">No stories today</span>'}
      </div>
      <div class="topic-full">
        ${dateNav}${groups}
      </div>
    </div>`;
  }).join('');
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §9  SECONDARY PAGES                                                   ║
// ║  About (Resources), Weekly Digest, Digest Page, Source Spectrum,       ║
// ║  Ops Metrics, Source Manager                                           ║
// ╚══════════════════════════════════════════════════════════════════════════╝

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
      ${digest.top10.map((story) => `<div class="archive-briefing-card"><div><div class="archive-lead">${escapeHtml(story.headline)}</div><div class="archive-meta">${escapeHtml(story.sources?.[0]?.name || '')} &middot; Score ${scoreOutOfTen(story.score)}</div></div><div class="archive-dominant">${escapeHtml(story.topics?.[0] || 'Priority')}</div></div>`).join('')}
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
  if (!container) return;
  if (!digest) {
    container.innerHTML = '<div class="story-empty-state"><p>No digest available yet. Check back after the next scheduled briefing run.</p></div>';
    return;
  }
  if (title) title.textContent = digest.label || 'Weekly Intelligence Digest';
  if (intro) intro.textContent = digest.summary || 'Executive summary and highlights.';

  const leadStory = digest.top10?.[0];
  const supportStories = (digest.top10 || []).slice(1, 5);
  const remainingStories = (digest.top10 || []).slice(5);

  const editorialGrid = leadStory ? `<div class="digest-editorial-grid">
    <div class="digest-lead-story">
      <div class="digest-lead-headline">${escapeHtml(leadStory.headline || '')}</div>
      <div class="digest-lead-why">${escapeHtml(leadStory.whyItMatters || leadStory.dek || leadStory.summary || '')}</div>
      <div class="story-card-meta">${escapeHtml(leadStory.sources?.[0]?.name || '')} &middot; Score ${scoreOutOfTen(leadStory.score)}</div>
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

  const remainingHtml = remainingStories.length ? `<div class="archive-week"><div class="archive-week-header"><span class="archive-week-title">More Highlights</span></div><div class="archive-week-body">${remainingStories.map((story) => `<div class="archive-briefing-card"><div><div class="archive-lead">${escapeHtml(story.headline)}</div><div class="archive-meta">${escapeHtml(story.sources?.[0]?.name || '')} &middot; Score ${scoreOutOfTen(story.score)}</div></div><div class="archive-dominant">${escapeHtml(story.topics?.[0] || '')}</div></div>`).join('')}</div></div>` : '';

  container.innerHTML = editorialGrid + recapSection + remainingHtml;
}

export function renderSourceSpectrum(stories) {
  const container = document.querySelector('.sidebar .source-spectrum');
  if (!container) return;
  container.dataset.renderedAt = new Date().toISOString();
  if (!Array.isArray(stories)) stories = [];
  if (!stories.length) {
    container.innerHTML = '<p class="spectrum-empty">Source data unavailable for this refresh cycle.</p>';
    return;
  }
  const orientCounts = {};
  stories.forEach((s) => {
    (s.sources || []).forEach((src) => {
      const o = src.orientation || 'center';
      orientCounts[o] = (orientCounts[o] || 0) + 1;
    });
  });
  // If only 'center' (the default) has counts and all others are zero,
  // treat as "no real orientation data" — keep placeholder HTML as-is.
  const hasOrientationData = Object.entries(orientCounts).some(([k, v]) => k !== 'center' && v > 0);
  if (!hasOrientationData) return;
  const total = Object.values(orientCounts).reduce((a, b) => a + b, 0) || 1;
  const rows = [
    { key: 'left',         label: 'Left',         color: 'oklch(0.58 0.14 240)', weight: -2 },
    { key: 'center-left',  label: 'Center-Left',  color: 'oklch(0.68 0.12 240)', weight: -1 },
    { key: 'center',       label: 'Center',       color: 'oklch(0.65 0.01 250)', weight:  0 },
    { key: 'center-right', label: 'Center-Right', color: 'oklch(0.65 0.14 60)',  weight:  1 },
    { key: 'right',        label: 'Right',        color: 'oklch(0.58 0.18 27)',  weight:  2 },
  ];
  // Compute lean score: weighted average of orientation counts
  let weightedSum = 0;
  rows.forEach((row) => { weightedSum += (orientCounts[row.key] || 0) * row.weight; });
  const leanScore = weightedSum / total;
  const centristPct = Math.round(((orientCounts['center'] || 0) + (orientCounts['center-left'] || 0) + (orientCounts['center-right'] || 0)) / total * 100);
  let leanLabel = 'Balanced';
  if (leanScore <= -0.8) leanLabel = 'Left-Leaning';
  else if (leanScore <= -0.3) leanLabel = 'Center-Left';
  else if (leanScore >= 0.8) leanLabel = 'Right-Leaning';
  else if (leanScore >= 0.3) leanLabel = 'Center-Right';

  const barsHtml = rows.filter((row) => (orientCounts[row.key] || 0) > 0).map((row) => {
    const count = orientCounts[row.key] || 0;
    const pct = Math.round((count / total) * 100);
    return `<div class="spectrum-row"><span class="spectrum-label">${escapeHtml(row.label)}</span><div class="spectrum-bar-track"><div class="spectrum-bar-fill spectrum-bar-fill--animated" style="--target-width:${pct}%;background:${row.color}"></div></div><span class="spectrum-count">${pct}%</span></div>`;
  }).join('');

  // Stacked horizontal bar — all segments in one strip
  const stackedSegments = rows.filter((row) => (orientCounts[row.key] || 0) > 0).map((row) => {
    const count = orientCounts[row.key] || 0;
    const pct = Math.round((count / total) * 100);
    return `<div class="spectrum-stacked-segment" style="width:${pct}%;background:${row.color}" title="${escapeHtml(row.label)}: ${count}">${pct > 15 ? pct + '%' : ''}</div>`;
  }).join('');
  const stackedLegend = rows.filter((row) => (orientCounts[row.key] || 0) > 0).map((row) => {
    const count = orientCounts[row.key] || 0;
    return `<span class="spectrum-stacked-legend-item"><i style="background:${row.color}"></i>${escapeHtml(row.label)} (${count})</span>`;
  }).join('');
  const stackedBar = `<div class="spectrum-stacked-bar">${stackedSegments}</div><div class="spectrum-stacked-legend">${stackedLegend}</div>`;

  container.innerHTML = `<div class="spectrum-lean-summary"><span class="spectrum-lean-label">Lean: ${escapeHtml(leanLabel)}</span><span class="spectrum-lean-detail">${centristPct}% centrist coverage</span></div>${stackedBar}${barsHtml}`;
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

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §10  SEARCH & STORY DETAIL PAGE                                       ║
// ║  Global search results, story page (spectrum, timeline, entities,      ║
// ║  confidence breakdown, related stories)                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝

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
      <h4><a href="${item.slug ? `/story/${escapeHtml(item.slug)}` : safeUrl(item.url)}"${item.slug ? '' : ' target="_blank" rel="noopener noreferrer"'}>${escapeHtml(item.title)}</a></h4>
      ${item.summary ? `<p class="story-card-excerpt">${escapeHtml(item.summary)}</p>` : ''}
    </div>`;
  }).join('');
}

function buildSpectrumHtml(spectrum) {
  if (!spectrum || !spectrum.length) return '';
  const hasData = spectrum.some((r) => r.count > 0);
  if (!hasData) return '';
  return `
    <div class="spectrum-full">
      <div class="spectrum-bar-full">
        ${spectrum.filter((r) => r.percent > 0).map((row) =>
          `<div class="spectrum-segment"
                style="width:${Number(row.percent)||0}%;background:${escapeHtml(row.color||'')}"
                title="${escapeHtml(row.label)}: ${row.count} source${row.count !== 1 ? 's' : ''}">
            <span class="spectrum-segment-label">${Number(row.percent) > 12 ? escapeHtml(row.label) : ''}</span>
          </div>`
        ).join('')}
      </div>
      <div class="spectrum-legend">
        ${spectrum.filter((r) => r.count > 0).map((row) =>
          `<span><i style="background:${escapeHtml(row.color||'')}"></i>${escapeHtml(row.label)} (${row.count})</span>`
        ).join('')}
      </div>
    </div>`;
}

function buildTimelineHtml(timeline) {
  if (!timeline || !timeline.length) return '';
  return `<ol class="story-timeline">
    ${timeline.map((item, i) => `
      <li class="timeline-item${i === 0 ? ' timeline-item--first' : ''}">
        <div class="timeline-dot"></div>
        <time class="timeline-time">${escapeHtml(formatDate(item.publishedAt) + ' ' + formatTime(item.publishedAt))}</time>
        <div class="timeline-content">
          <span class="timeline-source">${escapeHtml(item.source || '')}</span>
          <a href="${safeUrl(item.url)}" class="timeline-title" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title || '')}</a>
        </div>
      </li>`
    ).join('')}
  </ol>`;
}

function buildEntitiesHtml(entities) {
  if (!entities) return '';
  const groups = [
    { key: 'people',    label: 'People',       type: 'person',  items: (entities.people || []).slice(0, 4).map((e) => e.name || e) },
    { key: 'orgs',      label: 'Organizations', type: 'org',    items: (entities.orgs || []).slice(0, 4).map((e) => e.name || e) },
    { key: 'tickers',   label: 'Tickers',       type: 'ticker', items: (entities.tickers || []).slice(0, 4).map((e) => e.symbol || e.name || e) },
    { key: 'countries', label: 'Countries',     type: 'country',items: (entities.countries || []).slice(0, 3).map((e) => e.name || e) },
  ].filter((g) => g.items.length);
  if (!groups.length) return '';
  return groups.map((g) => `
    <div class="entity-group">
      <span class="entity-group-label">${escapeHtml(g.label)}</span>
      ${g.items.map((name) =>
        `<a href="#" class="entity-chip entity-chip--${g.type}" data-search-entity="${escapeHtml(String(name))}">${escapeHtml(name)}</a>`
      ).join('')}
    </div>`
  ).join('');
}

function buildConfidenceBreakdownHtml(scoreBreakdown) {
  if (!scoreBreakdown) return '';
  const rows = [
    { label: 'Tier weight',         value: scoreBreakdown.tierWeight || 0,         max: 1,    positive: true },
    { label: 'Recency',             value: scoreBreakdown.recency || 0,             max: 1,    positive: true },
    { label: 'Topic boost',         value: scoreBreakdown.cappedTopicBoosts || 0,   max: 0.18, positive: true },
    { label: 'US priority',         value: scoreBreakdown.usPriorityBoost || 0,     max: 0.12, positive: true },
    { label: 'Strategic intl',      value: scoreBreakdown.strategicIntlBoost || 0,  max: 0.04, positive: true },
    { label: 'Duplicate penalty',   value: scoreBreakdown.duplicatePenalty || 0,    max: 0.15, positive: false },
    { label: 'Foreign local pen.',  value: scoreBreakdown.foreignLocalPenalty || 0, max: 0.14, positive: false },
    { label: 'Baseline penalty',    value: scoreBreakdown.baselinePenalty || 0,     max: 0.18, positive: false },
  ].filter((r) => r.value > 0);
  if (!rows.length) return '';
  return `
    <div class="confidence-breakdown">
      <button class="confidence-breakdown-toggle" data-toggle-breakdown aria-expanded="false">
        SCORE BREAKDOWN <span>&#9662;</span>
      </button>
      <div class="confidence-breakdown-body">
        ${rows.map((r) => {
          const pct = Math.min(100, Math.round((r.value / r.max) * 100));
          return `<div class="score-bar-row">
            <div class="score-bar-label">
              <span>${escapeHtml(r.label)}</span>
              <span>${r.value.toFixed(3)}</span>
            </div>
            <div class="score-bar-track">
              <div class="score-bar-fill${r.positive ? '' : ' negative'}" style="width:${pct}%"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

/**
 * Estimate reading time from text content.
 * @param {string} text
 * @returns {number} minutes
 */
function estimateReadingTime(text) {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

/**
 * Build a byline HTML string from story metadata.
 */
function buildBylineHtml(story) {
  const parts = [];
  // Source names
  const sourceNames = (story.sources || []).slice(0, 3).map((s) => s.name || s).filter(Boolean);
  if (sourceNames.length) {
    parts.push(`<span class="story-byline-source">${sourceNames.map(escapeHtml).join(', ')}</span>`);
  }
  // Published date
  if (story.updatedAt || story.publishedAt) {
    const dateStr = formatDate(story.updatedAt || story.publishedAt);
    const timeStr = formatTime(story.updatedAt || story.publishedAt);
    if (parts.length) parts.push('<span class="story-byline-separator" aria-hidden="true"></span>');
    parts.push(`<time class="story-byline-date" datetime="${escapeHtml(story.updatedAt || story.publishedAt)}">${escapeHtml(dateStr)} ${escapeHtml(timeStr)}</time>`);
  }
  // Reading time estimate
  const allText = [story.whyItMatters, story.whatsNext, story.dek].filter(Boolean).join(' ');
  const readMin = estimateReadingTime(allText);
  if (parts.length) parts.push('<span class="story-byline-separator" aria-hidden="true"></span>');
  parts.push(`<span class="story-byline-reading">${readMin} min read</span>`);
  return parts.join('');
}

/**
 * Build author card HTML for the bottom of the story.
 */
function buildAuthorCardHtml(story) {
  const sources = (story.sources || []).slice(0, 3);
  if (!sources.length) return '';
  const primarySource = sources[0];
  const name = primarySource.name || primarySource;
  const initial = (typeof name === 'string' ? name : '').charAt(0).toUpperCase() || 'S';
  const tierLabel = primarySource.tierLabel || '';
  const sourceCount = sources.length;
  return `
    <div class="author-card">
      <div class="author-card-avatar" aria-hidden="true">${escapeHtml(initial)}</div>
      <div class="author-card-body">
        <div class="author-card-name">${escapeHtml(typeof name === 'string' ? name : '')}</div>
        ${tierLabel ? `<div class="author-card-role">${escapeHtml(tierLabel)}</div>` : ''}
        <div class="author-card-bio">${sourceCount > 1 ? `Aggregated from ${sourceCount} sources including ${sources.slice(1).map((s) => escapeHtml(s.name || s)).join(', ')}.` : 'Primary reporting source for this story.'}</div>
      </div>
    </div>`;
}

/**
 * Build a pull quote from the story's dek or whyItMatters text.
 */
function buildPullQuoteHtml(story) {
  // Use the dek as a pull quote if it's substantial enough
  const text = story.dek || '';
  if (text.length < 60) return '';
  const primarySource = (story.sources || [])[0];
  const citation = primarySource ? (primarySource.name || primarySource) : '';
  return `
    <div class="story-pull-quote">
      <p>${escapeHtml(text)}</p>
      ${citation ? `<cite>${escapeHtml(typeof citation === 'string' ? citation : '')}</cite>` : ''}
    </div>`;
}

export function renderStoryPage(story) {
  if (!story) return;
  const title = document.getElementById('storyTitle');
  const dek = document.getElementById('storyDek');
  const updated = document.getElementById('storyUpdated');
  const verification = document.getElementById('storyVerification');
  const confidence = document.getElementById('storyConfidence');
  const tags = document.getElementById('storyTags');
  const byline = document.getElementById('storyByline');
  const pullQuote = document.getElementById('storyPullQuote');
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
  const authorCard = document.getElementById('storyAuthorCard');

  if (title) title.textContent = story.headline;
  if (dek) dek.textContent = story.dek || '';
  if (updated) updated.textContent = `Updated ${formatDate(story.updatedAt)} ${formatTime(story.updatedAt)}`;
  if (verification) verification.textContent = story.verificationTier || 'Verification';
  if (confidence) confidence.textContent = `Confidence ${story.confidenceLabel || ''}`;
  if (tags) tags.innerHTML = (story.topics || []).map((topic) => `<span class="story-tag" data-category="${escapeHtml(topic)}">${escapeHtml(topic)}</span>`).join('');
  if (saveBtn) saveBtn.dataset.save = story.id;
  if (followBtn) followBtn.dataset.follow = story.topics?.[0] || '';

  // Byline
  if (byline) byline.innerHTML = buildBylineHtml(story);

  // Pull quote (between why and what's next)
  if (pullQuote) pullQuote.innerHTML = buildPullQuoteHtml(story);

  if (why) why.textContent = story.whyItMatters || '';
  if (next) next.textContent = story.whatsNext || '';
  if (timeline) {
    timeline.innerHTML = buildTimelineHtml(story.timeline);
  }
  if (sources) {
    sources.innerHTML = (story.sources || []).map((item) => `<div class="story-source-item"><div class="story-card-title">${escapeHtml(item.name)}</div><div class="story-card-footer">${escapeHtml(item.tierLabel || '')}</div></div>`).join('');
  }
  if (docs) {
    docs.innerHTML = (story.primaryDocs || []).map((doc) => `<div class="story-doc-item"><a href="${safeUrl(doc.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(doc.title)}</a>${doc.label ? `<div class="story-card-footer">${escapeHtml(doc.label)}</div>` : ''}</div>`).join('') || '<div class="story-doc-item">Primary filings listed when available.</div>';
  }
  if (related) {
    related.innerHTML = (story.related || []).map((item) => `<div class="story-related-item"><a href="/story/${escapeHtml(item.slug)}" data-open-story="${escapeHtml(item.slug)}">${escapeHtml(item.headline)}</a></div>`).join('') || '<div class="story-related-item">No related clusters yet.</div>';
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
    spectrum.innerHTML = buildSpectrumHtml(story.spectrum);
  }

  // Entity chips
  const entitiesContainer = document.getElementById('storyEntities');
  const entitiesSection = document.getElementById('storyEntitiesSection');
  if (entitiesContainer) {
    const html = buildEntitiesHtml(story.entities);
    entitiesContainer.innerHTML = html;
    if (entitiesSection) entitiesSection.style.display = html ? '' : 'none';
  }

  // Confidence breakdown
  const confidenceContainer = document.getElementById('storyConfidenceBreakdown');
  const confidenceCard = document.getElementById('storyConfidenceBreakdownCard');
  if (confidenceContainer) {
    const html = buildConfidenceBreakdownHtml(story.scoreBreakdown);
    confidenceContainer.innerHTML = html;
    if (confidenceCard) confidenceCard.style.display = html ? '' : 'none';
  }

  // Author card at bottom of story-main
  if (authorCard) authorCard.innerHTML = buildAuthorCardHtml(story);

  // Reset reading progress
  const progressBar = document.getElementById('readingProgress');
  if (progressBar) progressBar.style.width = '0%';

  renderArticleJsonLd(story);
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §11  ARCHIVE TAB                                                      ║
// ║  Date-grouped archive with chip navigation, card grid, show-more       ║
// ╚══════════════════════════════════════════════════════════════════════════╝

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

    const label = formatArchiveDate(day.date);
    const dateStr = day.date ? new Date(day.date + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : label;

    const cardList = stories.map((story, idx) => {
      const score = story.score != null ? scoreOutOfTen(story.score) : '--';
      const sourceName = story.sources?.[0]?.name || story.source || '';
      const topic = (story.topics?.[0] || '').replace(/_/g, ' ');
      const topicRaw = story.topics?.[0] || '';
      const tier = story.tier || 3;
      const slug = story.slug ? escapeHtml(story.slug) : '';
      const time = formatTime(story.updatedAt || story.publishedAt);
      const { open, external } = renderStoryActions(story);
      const thumb = renderStoryThumb(story.imageUrl, 'archive-grid-thumb', story.headline || '', story.topics);
      const titleHtml = slug
        ? `<a href="/story/${slug}" data-open-story="${slug}">${escapeHtml(story.headline)}</a>`
        : escapeHtml(story.headline);
      const storyHour = new Date(story.updatedAt || story.publishedAt || 0).getHours();
      const storyRun = storyHour < 11 ? 'morning' : storyHour < 15 ? 'midday' : 'evening';
      const hiddenClass = idx >= 3 ? ' archive-card--overflow' : '';
      return `<article class="archive-grid-card${hiddenClass}" data-topic="${escapeHtml(topicRaw)}" data-tier="${escapeHtml(String(tier))}" data-run="${storyRun}" data-text="${escapeHtml((story.headline || '') + ' ' + (story.dek || '') + ' ' + sourceName).toLowerCase()}">
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
    });

    const hiddenCount = Math.max(0, stories.length - 3);
    const showMoreBtn = hiddenCount > 0
      ? `<button class="archive-show-more" data-expand-day="${escapeHtml(day.date || '')}" type="button">Show ${hiddenCount} more stor${hiddenCount === 1 ? 'y' : 'ies'}</button>`
      : '';

    return `<section class="archive-day-section" id="archive-day-${escapeHtml(day.date || '')}" data-date="${escapeHtml(day.date || '')}">
      <div class="archive-day-section-header">
        <h2 class="archive-day-label">${escapeHtml(dateStr)}</h2>
        <span class="archive-day-count">${stories.length} stor${stories.length === 1 ? 'y' : 'ies'}</span>
      </div>
      <div class="archive-grid">${cardList.join('') || '<p class="archive-empty">No stories for this date.</p>'}</div>
      ${showMoreBtn}
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

function formatArchiveDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T12:00:00Z');
  if (isNaN(d)) return isoDate;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §12  ADMIN & SEO                                                      ║
// ║  Scoring panel (admin sliders) and JSON-LD structured data             ║
// ╚══════════════════════════════════════════════════════════════════════════╝

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

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §L  LEGISLATION — Interactive US Map + State Panel                    ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ── Adjacency-safe 4-color assignment (backtracking solver, no bordering states share a tone) ──
// Tones: 1 = sandy beige, 2 = warm stone, 3 = dusty sage, 4 = warm clay
const STATE_COLOR_MAP = {
  AK:1,AL:3,AR:3,AZ:3,CA:1,CO:1,CT:3,DC:3,DE:3,FL:2,GA:1,HI:1,
  IA:2,ID:1,IL:4,IN:1,KS:4,KY:3,LA:2,MA:1,MD:2,ME:1,MI:3,MN:3,
  MO:1,MS:1,MT:2,NC:3,ND:4,NE:3,NH:2,NJ:4,NM:4,NV:4,NY:2,OH:2,
  OK:2,OR:2,PA:1,RI:2,SC:2,SD:1,TN:2,TX:1,UT:2,VA:1,VT:3,WA:3,
  WI:1,WV:4,WY:4
};

const SMALL_STATES = new Set(['RI','DE','CT','NJ','MD','MA','VT','NH','DC']);

// ── Polylabel: find the visual center (pole of inaccessibility) of a polygon ──
// Returns the point inside the polygon farthest from any edge.
// Adapted from Mapbox's polylabel algorithm (ISC license).
function polylabel(rings, precision = 1.0) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const outerRing = rings[0];
  for (const [x, y] of outerRing) {
    if (x < minX) minX = x; if (y < minY) minY = y;
    if (x > maxX) maxX = x; if (y > maxY) maxY = y;
  }
  const width = maxX - minX, height = maxY - minY;
  const cellSize = Math.max(width, height);
  if (cellSize === 0) return [minX, minY];
  let h = cellSize / 2;
  const distFn = (px, py) => pointToPolygonDist(px, py, rings);
  // Cover bbox with initial cells
  let best = getCentroidCell(rings);
  const bboxCell = { x: minX + width / 2, y: minY + height / 2, h, d: distFn(minX + width / 2, minY + height / 2) };
  if (bboxCell.d > best.d) best = bboxCell;
  const queue = [];
  const pushCell = (cx, cy, ch) => {
    const d = distFn(cx, cy);
    const max = d + ch * Math.SQRT2;
    if (max > best.d) queue.push({ x: cx, y: cy, h: ch, d, max });
  };
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      pushCell(x + h, y + h, h);
    }
  }
  queue.sort((a, b) => a.max - b.max);
  while (queue.length) {
    const cell = queue.pop();
    if (cell.d > best.d) best = cell;
    if (cell.max - best.d <= precision) continue;
    h = cell.h / 2;
    pushCell(cell.x - h, cell.y - h, h);
    pushCell(cell.x + h, cell.y - h, h);
    pushCell(cell.x - h, cell.y + h, h);
    pushCell(cell.x + h, cell.y + h, h);
    queue.sort((a, b) => a.max - b.max);
  }
  return [best.x, best.y];
}
function pointToPolygonDist(px, py, rings) {
  let inside = false, minDist = Infinity;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [ax, ay] = ring[i], [bx, by] = ring[j];
      if ((ay > py) !== (by > py) && px < (bx - ax) * (py - ay) / (by - ay) + ax) inside = !inside;
      minDist = Math.min(minDist, segDistSq(px, py, ax, ay, bx, by));
    }
  }
  return (inside ? 1 : -1) * Math.sqrt(minDist);
}
function segDistSq(px, py, ax, ay, bx, by) {
  let dx = bx - ax, dy = by - ay;
  if (dx !== 0 || dy !== 0) {
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    ax += t * dx; ay += t * dy;
  }
  dx = px - ax; dy = py - ay;
  return dx * dx + dy * dy;
}
function getCentroidCell(rings) {
  let area = 0, cx = 0, cy = 0;
  const ring = rings[0];
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[i], [bx, by] = ring[j];
    const f = ax * by - bx * ay;
    cx += (ax + bx) * f; cy += (ay + by) * f; area += f;
  }
  if (area === 0) return { x: ring[0][0], y: ring[0][1], h: 0, d: 0 };
  area *= 0.5; cx /= (6 * area); cy /= (6 * area);
  return { x: cx, y: cy, h: 0, d: pointToPolygonDist(cx, cy, rings) };
}

// ── Parse SVG path (M/L/Z) into polygon rings ──
function pathToRings(d) {
  const rings = [];
  let current = [];
  const parts = d.match(/[MLZ][^MLZ]*/g) || [];
  for (const part of parts) {
    const cmd = part[0];
    if (cmd === 'Z') {
      if (current.length > 2) rings.push(current);
      current = [];
    } else {
      const nums = part.slice(1).match(/-?[\d.]+/g);
      if (nums) {
        for (let i = 0; i < nums.length - 1; i += 2) {
          current.push([parseFloat(nums[i]), parseFloat(nums[i + 1])]);
        }
      }
    }
  }
  if (current.length > 2) rings.push(current);
  return rings;
}

// ── Get visual center for a state (uses largest ring for multi-polygon states) ──
function getStateVisualCenter(pathData) {
  const allRings = pathToRings(pathData);
  if (!allRings.length) return [480, 300];
  // Find the largest ring by area (handles AK, MI, HI multi-polygon)
  let largestRing = allRings[0], largestArea = 0;
  for (const ring of allRings) {
    let area = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      area += ring[i][0] * ring[j][1] - ring[j][0] * ring[i][1];
    }
    area = Math.abs(area);
    if (area > largestArea) { largestArea = area; largestRing = ring; }
  }
  return polylabel([largestRing], 0.5);
}

// ── Small states: computed leader-line layout (sorted by y, minimum spacing) ──
const SMALL_STATE_IDS = ['VT','NH','MA','RI','CT','NJ','DE','MD','DC'];
const SMALL_STATE_LABEL_X = 915; // Label column x-position (right of NE coast)
const SMALL_STATE_MIN_GAP = 16;  // Minimum vertical spacing between labels

// ── Manual nudges for states where polylabel is geometrically correct but visually off ──
const LABEL_NUDGES = {
  FL: { dx: -40, dy: -20 },
  OK: { dx: -25, dy: 0 },
  MI: { dx: 0, dy: -10 },
  LA: { dx: 10, dy: 10 },
  ID: { dx: 0, dy: -15 },
  CA: { dx: 5, dy: 0 },
  NY: { dx: 5, dy: 5 },
  VA: { dx: -10, dy: -5 },
  MD: { dx: 0, dy: 0 },
  HI: { dx: 0, dy: -5 },
};

let legMapTooltip = null;
let legMapSelectedState = null;
let legPanelState = { filters: {}, page: 0 };

// ── Full state name lookup ──
const STATE_NAMES = {};
const STATE_LIST_ORDER = [];

// ── Category icons (Lucide-style inline SVG paths) ──
const LEG_CATEGORY_ICONS = {
  'Healthcare': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"/></svg>',
  'Education': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  'Environment': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1.5 2 2.1 5.5A7 7 0 0 1 11 20z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  'Criminal Justice': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',
  'Economy & Taxes': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  'Civil Rights': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  'Infrastructure': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',
  'Public Safety': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>',
  'Other': '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
};

export function renderUSMap(container) {
  if (!container) return;
  container.innerHTML = '';
  legMapSelectedState = null;

  // Create tooltip (shared singleton)
  if (!legMapTooltip) {
    legMapTooltip = document.createElement('div');
    legMapTooltip.className = 'leg-map-tooltip';
    legMapTooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(legMapTooltip);
  }
  legMapTooltip.style.display = 'none';

  // Build SVG
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 960 600');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('class', 'leg-map-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Interactive map of the United States');

  // Radial gradient background glow (::before pseudo handled in CSS)

  // Inset divider line (separates AK/HI from continental US)
  const divider = document.createElementNS(svgNS, 'line');
  divider.setAttribute('x1', '30'); divider.setAttribute('y1', '510');
  divider.setAttribute('x2', '380'); divider.setAttribute('y2', '510');
  divider.setAttribute('class', 'leg-map-divider');
  svg.appendChild(divider);

  // State paths group (with noise texture filter for printed-map feel)
  const pathsGroup = document.createElementNS(svgNS, 'g');
  pathsGroup.setAttribute('class', 'leg-map-paths');
  pathsGroup.setAttribute('filter', 'url(#mapNoise)');

  // Labels group (rendered on top of paths)
  const labelsGroup = document.createElementNS(svgNS, 'g');
  labelsGroup.setAttribute('class', 'leg-map-labels');

  // Build name lookup
  US_STATES.forEach((s) => {
    STATE_NAMES[s.id] = s.name;
    if (!STATE_LIST_ORDER.includes(s.id)) STATE_LIST_ORDER.push(s.id);
  });
  STATE_LIST_ORDER.sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));

  // ── SVG filter definitions for label halos and hover effects ──
  const defs = document.createElementNS(svgNS, 'defs');
  // Label halo filter
  defs.innerHTML = `
    <filter id="labelHalo" x="-30%" y="-30%" width="160%" height="160%">
      <feMorphology operator="dilate" radius="1.2" in="SourceAlpha" result="thick"/>
      <feGaussianBlur in="thick" stdDeviation="0.8" result="blur"/>
      <feFlood flood-color="rgba(255,255,255,0.65)" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="halo"/>
      <feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="stateElevate" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
    <filter id="mapNoise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="mono"/>
      <feBlend in="SourceGraphic" in2="mono" mode="multiply"/>
    </filter>
    <marker id="leaderDot" viewBox="0 0 4 4" refX="2" refY="2" markerWidth="4" markerHeight="4">
      <circle cx="2" cy="2" r="1.2" fill="rgba(100,80,60,0.5)"/>
    </marker>
    <pattern id="mapGrid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.018)" stroke-width="0.5"/>
    </pattern>`;
  svg.appendChild(defs);

  // Grid overlay (subtle intelligence/cartographic feel)
  const grid = document.createElementNS(svgNS, 'rect');
  grid.setAttribute('width', '960'); grid.setAttribute('height', '600');
  grid.setAttribute('fill', 'url(#mapGrid)');
  grid.style.pointerEvents = 'none';
  svg.appendChild(grid);

  // ── Compute visual centers for ALL states using polylabel ──
  const visualCenters = {};
  US_STATES.forEach((state) => {
    const [cx, cy] = getStateVisualCenter(state.path);
    const nudge = LABEL_NUDGES[state.id];
    visualCenters[state.id] = nudge ? [cx + nudge.dx, cy + nudge.dy] : [cx, cy];
  });

  // ── Create state paths (sorted by x for west-to-east entrance) ──
  const statesByX = [...US_STATES].sort((a, b) => visualCenters[a.id][0] - visualCenters[b.id][0]);
  statesByX.forEach((state, index) => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', state.path);
    const colorIdx = STATE_COLOR_MAP[state.id] || 1;
    const hasData = !!getLegData(state.id);
    path.setAttribute('class', `leg-state-path leg-state-c${colorIdx}${hasData ? ' leg-state-active' : ''}`);
    path.setAttribute('data-state', state.id);
    path.setAttribute('data-state-name', state.name);
    path.setAttribute('aria-label', state.name);
    path.setAttribute('role', 'button');
    path.setAttribute('tabindex', '0');
    path.style.animationDelay = `${index * 12}ms`;
    // Set transform-origin to visual center for hover scale effect
    const [vcx, vcy] = visualCenters[state.id];
    path.style.transformOrigin = `${vcx}px ${vcy}px`;
    pathsGroup.appendChild(path);
  });

  svg.appendChild(pathsGroup);
  container.appendChild(svg);

  // ── Create labels using polylabel visual centers ──

  // Small states: compute non-overlapping label column layout
  const smallStatesData = SMALL_STATE_IDS
    .map((id) => ({ id, cx: visualCenters[id][0], cy: visualCenters[id][1] }))
    .sort((a, b) => a.cy - b.cy); // Sort north to south

  // Space labels evenly with minimum gap
  let nextY = smallStatesData[0] ? smallStatesData[0].cy - 20 : 100;
  const smallLabelPositions = {};
  for (const s of smallStatesData) {
    const labelY = Math.max(nextY, s.cy);
    smallLabelPositions[s.id] = { labelX: SMALL_STATE_LABEL_X, labelY };
    nextY = labelY + SMALL_STATE_MIN_GAP;
  }

  // Render all labels
  US_STATES.forEach((state, index) => {
    const [cx, cy] = visualCenters[state.id];
    const isSmall = SMALL_STATES.has(state.id);
    let labelX = cx, labelY = cy;

    if (isSmall && smallLabelPositions[state.id]) {
      labelX = smallLabelPositions[state.id].labelX;
      labelY = smallLabelPositions[state.id].labelY;

      // Leader line with dot marker
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      line.setAttribute('x2', labelX - 8); line.setAttribute('y2', labelY);
      line.setAttribute('class', 'leg-state-leader');
      line.setAttribute('marker-start', 'url(#leaderDot)');
      labelsGroup.appendChild(line);
    }

    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', labelX);
    text.setAttribute('y', labelY);
    text.setAttribute('text-anchor', isSmall ? 'end' : 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('class', `leg-state-label${isSmall ? ' leg-state-label--small' : ''}`);
    text.setAttribute('data-state', state.id);
    text.textContent = state.id;
    text.style.animationDelay = `${index * 8 + 200}ms`;
    labelsGroup.appendChild(text);
  });

  svg.appendChild(labelsGroup);

  // Vignette overlay (darker edges for depth)
  const vignette = document.createElementNS(svgNS, 'rect');
  vignette.setAttribute('width', '960'); vignette.setAttribute('height', '600');
  vignette.setAttribute('fill', 'none');
  vignette.setAttribute('style', 'pointer-events:none');
  vignette.setAttribute('class', 'leg-map-vignette');
  svg.appendChild(vignette);

  // ── Render sidebar ──
  const sidebar = document.getElementById('legSidebar');
  if (sidebar) renderMapSidebar(sidebar);

  // ── SVG Event handlers ──

  // Hover: tooltip + sidebar quick-stat + label highlight
  let lastHoveredAbbr = null;
  svg.addEventListener('mousemove', (e) => {
    const p = e.target.closest('.leg-state-path');
    if (!p) {
      legMapTooltip.style.display = 'none';
      if (lastHoveredAbbr) {
        svg.classList.remove('has-hover');
        const prev = svg.querySelector(`.leg-state-label[data-state="${lastHoveredAbbr}"]`);
        if (prev) prev.classList.remove('label-active');
        lastHoveredAbbr = null;
      }
      return;
    }
    const name = p.dataset.stateName;
    const abbr = p.dataset.state;
    const data = getLegData(abbr);
    const billCount = data ? data.totalBills : 0;
    const passedCount = data ? data.bills.filter(b => b.status === 'Passed').length : 0;
    const proposedCount = billCount - passedCount;
    legMapTooltip.innerHTML = `
      <span class="leg-tooltip-badge">PRIMARY SOURCE</span>
      <span class="leg-tooltip-name">${escapeHtml(name)}</span>
      <span class="leg-tooltip-domain"><strong>${escapeHtml(abbr)}</strong> <span class="leg-tooltip-path">/ legislature / ${new Date().getFullYear()} session</span></span>
      <span class="leg-tooltip-stat">${billCount} active bill${billCount !== 1 ? 's' : ''} · <span class="leg-tooltip-passed">${passedCount} passed</span> · <span class="leg-tooltip-proposed">${proposedCount} proposed</span></span>
      <span class="leg-tooltip-date">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>`;
    legMapTooltip.style.display = '';
    const tx = e.clientX + 16, ty = e.clientY - 10;
    const tw = legMapTooltip.offsetWidth, th = legMapTooltip.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    legMapTooltip.style.left = (tx + tw > vw - 12 ? e.clientX - tw - 12 : tx) + 'px';
    legMapTooltip.style.top = (ty + th > vh - 12 ? e.clientY - th - 12 : ty) + 'px';
    updateQuickStat(abbr);
    highlightSidebarItem(abbr);
    // Label highlight: dim all, brighten hovered
    if (abbr !== lastHoveredAbbr) {
      if (lastHoveredAbbr) {
        const prev = svg.querySelector(`.leg-state-label[data-state="${lastHoveredAbbr}"]`);
        if (prev) prev.classList.remove('label-active');
      }
      svg.classList.add('has-hover');
      const lbl = svg.querySelector(`.leg-state-label[data-state="${abbr}"]`);
      if (lbl) lbl.classList.add('label-active');
      lastHoveredAbbr = abbr;
    }
  });

  svg.addEventListener('mouseleave', () => {
    legMapTooltip.style.display = 'none';
    clearSidebarHighlight();
    clearQuickStat();
    svg.classList.remove('has-hover');
    if (lastHoveredAbbr) {
      const prev = svg.querySelector(`.leg-state-label[data-state="${lastHoveredAbbr}"]`);
      if (prev) prev.classList.remove('label-active');
      lastHoveredAbbr = null;
    }
  });

  // Click: select state
  svg.addEventListener('click', (e) => {
    const p = e.target.closest('.leg-state-path');
    if (!p) return;
    selectState(p.dataset.state);
  });

  // Keyboard: Enter/Space to select
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const p = e.target.closest('.leg-state-path');
      if (p) { e.preventDefault(); selectState(p.dataset.state); }
    }
  });
}

// ── Sidebar rendering ──
function renderMapSidebar(sidebar) {
  sidebar.innerHTML = `
    <div class="leg-search-wrap">
      <svg class="leg-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" class="leg-search-input" id="legStateSearch" placeholder="Search a state..." autocomplete="off" spellcheck="false">
    </div>
    <ul class="leg-state-list" id="legStateList"></ul>
    <div class="leg-quick-stat" id="legQuickStat">
      <div class="leg-quick-stat-empty">Hover a state to preview</div>
    </div>
  `;

  const list = sidebar.querySelector('#legStateList');
  STATE_LIST_ORDER.forEach((abbr) => {
    const name = STATE_NAMES[abbr];
    const li = document.createElement('li');
    li.className = 'leg-state-item';
    li.dataset.state = abbr;
    li.innerHTML = `<span class="leg-state-item-name">${name}</span><span class="leg-state-item-abbr">${abbr}</span>`;
    list.appendChild(li);
  });

  // Search filtering
  const searchInput = sidebar.querySelector('#legStateSearch');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    list.querySelectorAll('.leg-state-item').forEach((li) => {
      const name = STATE_NAMES[li.dataset.state].toLowerCase();
      const abbr = li.dataset.state.toLowerCase();
      const match = !q || name.includes(q) || abbr.includes(q);
      li.classList.toggle('leg-state-item--hidden', !match);
    });
  });

  // List item click → select state
  list.addEventListener('click', (e) => {
    const li = e.target.closest('.leg-state-item');
    if (li) selectState(li.dataset.state);
  });

  // List item hover → quick stat + map highlight
  list.addEventListener('mouseover', (e) => {
    const li = e.target.closest('.leg-state-item');
    if (li) {
      updateQuickStat(li.dataset.state);
      highlightMapState(li.dataset.state);
    }
  });
  list.addEventListener('mouseleave', () => {
    clearQuickStat();
    clearMapHighlight();
  });
}

function highlightSidebarItem(abbr) {
  document.querySelectorAll('.leg-state-item').forEach((li) => {
    li.classList.toggle('leg-state-item--hover', li.dataset.state === abbr);
  });
}
function clearSidebarHighlight() {
  document.querySelectorAll('.leg-state-item--hover').forEach((li) => li.classList.remove('leg-state-item--hover'));
}
function highlightMapState(abbr) {
  document.querySelectorAll('.leg-state-path').forEach((p) => {
    p.classList.toggle('map-hover', p.dataset.state === abbr);
  });
}
function clearMapHighlight() {
  document.querySelectorAll('.leg-state-path.map-hover').forEach((p) => p.classList.remove('map-hover'));
}

// ── Quick-stat panel ──
function updateQuickStat(abbr) {
  const el = document.getElementById('legQuickStat');
  if (!el) return;
  const data = getLegData(abbr);
  const name = STATE_NAMES[abbr] || abbr;
  if (!data) {
    el.innerHTML = `<div class="leg-quick-stat-content"><strong>${name}</strong> (${abbr})<br><span class="leg-qs-dim">No data available</span></div>`;
    return;
  }
  el.innerHTML = `
    <div class="leg-quick-stat-content">
      <div class="leg-qs-name">${name} <span class="leg-qs-abbr">${abbr}</span></div>
      <div class="leg-qs-row"><span class="leg-qs-label">Total Bills This Session:</span><span class="leg-qs-val">${data.totalBills}</span></div>
      <div class="leg-qs-row"><span class="leg-qs-label">Passed:</span><span class="leg-qs-val leg-qs-passed">${data.passed}</span><span class="leg-qs-sep">|</span><span class="leg-qs-label">Proposed:</span><span class="leg-qs-val leg-qs-proposed">${data.proposed}</span></div>
      <div class="leg-qs-row"><span class="leg-qs-label">Most Active Category:</span><span class="leg-qs-val">${data.topCategory}</span></div>
    </div>`;
}
function clearQuickStat() {
  const el = document.getElementById('legQuickStat');
  if (el) el.innerHTML = '<div class="leg-quick-stat-empty">Hover a state to preview</div>';
}

// ── Lazy-load legislation data ──
let _legDataModule = null;
async function loadLegData() {
  if (!_legDataModule) {
    try { _legDataModule = await import('./legislation.js'); } catch { _legDataModule = { STATE_LEGISLATION: {} }; }
  }
  return _legDataModule.STATE_LEGISLATION;
}
function getLegData(abbr) {
  if (!_legDataModule) return null;
  return _legDataModule.STATE_LEGISLATION[abbr] || null;
}

// Eagerly start loading legislation data
loadLegData();

// ── State selection (shared by map click, sidebar click, search) ──
function selectState(stateId) {
  const svg = document.querySelector('.leg-map-svg');
  if (svg) {
    svg.querySelectorAll('.leg-state-path.selected').forEach((p) => p.classList.remove('selected'));
    const path = svg.querySelector(`.leg-state-path[data-state="${stateId}"]`);
    if (path) path.classList.add('selected');
  }
  // Update sidebar active
  document.querySelectorAll('.leg-state-item').forEach((li) => {
    li.classList.toggle('leg-state-item--active', li.dataset.state === stateId);
  });
  legMapSelectedState = stateId;
  legMapTooltip && (legMapTooltip.style.display = 'none');
  // Dispatch event (app.js listens)
  const name = STATE_NAMES[stateId] || stateId;
  document.dispatchEvent(new CustomEvent('leg-state-selected', { detail: { id: stateId, name } }));
  // Render legislation panel
  renderLegislationPanel(stateId);
}

export function clearMapSelection() {
  const svg = document.querySelector('.leg-map-svg');
  if (svg) svg.querySelectorAll('.leg-state-path.selected').forEach((p) => p.classList.remove('selected'));
  document.querySelectorAll('.leg-state-item--active').forEach((li) => li.classList.remove('leg-state-item--active'));
  legMapSelectedState = null;
  const panel = document.getElementById('legStatePanel');
  if (panel) { panel.classList.remove('leg-panel-active'); setTimeout(() => { panel.innerHTML = ''; }, 350); }
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  §L.3  STATE LEGISLATION PANEL                                         ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const LEG_CATEGORIES = ['All','Healthcare','Education','Environment','Criminal Justice','Economy & Taxes','Civil Rights','Infrastructure','Public Safety','Other'];
const LEG_STATUSES = ['All','Proposed','Passed'];
const LEG_SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'category', label: 'Category A–Z' },
  { value: 'status', label: 'Status' }
];
const LEG_PAGE_SIZE = 20;

async function renderLegislationPanel(stateId) {
  const panel = document.getElementById('legStatePanel');
  if (!panel) return;

  const allData = await loadLegData();
  const stateData = allData[stateId];
  const name = STATE_NAMES[stateId] || stateId;

  if (!stateData) {
    panel.innerHTML = `<div class="leg-panel-empty"><div class="leg-panel-empty-icon">&#9878;</div><p class="leg-panel-empty-heading">No data available for ${name}</p></div>`;
    panel.classList.add('leg-panel-active');
    return;
  }

  // Reset filter state
  legPanelState = {
    stateId,
    categories: new Set(),
    status: 'All',
    sort: 'newest',
    search: '',
    page: 1,
    expanded: new Set()
  };

  const isNewPanel = !panel.classList.contains('leg-panel-active');
  const stateCode = stateId.toLowerCase();
  const flagUrl = `https://flagcdn.com/w40/us-${stateCode}.png`;

  panel.innerHTML = `
    <div class="leg-panel-header">
      <div class="leg-panel-header-top">
        <div class="leg-panel-state-info">
          <img src="${flagUrl}" alt="${escapeHtml(name)} flag" width="40" height="30" loading="lazy" class="leg-panel-flag" data-hide-on-error>
          <h2 class="leg-panel-state-name">${escapeHtml(name)}</h2>
        </div>
        <button class="leg-panel-back" type="button" data-leg-back>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Map
        </button>
      </div>
      <div class="leg-panel-stats">
        <span class="leg-panel-stat">Total Bills: <strong>${stateData.totalBills}</strong></span>
        <span class="leg-panel-stat">Passed: <strong class="leg-stat-passed">${stateData.passed}</strong></span>
        <span class="leg-panel-stat">Proposed: <strong class="leg-stat-proposed">${stateData.proposed}</strong></span>
        <span class="leg-panel-stat">Session: <strong>${stateData.session}</strong></span>
      </div>
    </div>
    <div class="leg-panel-controls">
      <div class="leg-panel-filters-row">
        <div class="leg-category-pills" id="legCategoryPills"></div>
        <div class="leg-filter-divider"></div>
        <div class="leg-status-pills" id="legStatusPills"></div>
      </div>
      <div class="leg-panel-search-row">
        <div class="leg-panel-sort-wrap">
          <select class="leg-panel-sort" id="legPanelSort">${LEG_SORTS.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}</select>
        </div>
        <div class="leg-panel-search-wrap">
          <svg class="leg-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" class="leg-panel-search" id="legPanelSearch" placeholder="Search bills..." autocomplete="off" spellcheck="false">
          <span class="leg-panel-search-count" id="legSearchCount"></span>
        </div>
      </div>
      <div class="leg-active-filters" id="legActiveFilters"></div>
    </div>
    <div class="leg-cards-grid" id="legCardsGrid"></div>
    <div class="leg-load-more-wrap" id="legLoadMoreWrap"></div>
  `;

  // Render category pills
  const catContainer = panel.querySelector('#legCategoryPills');
  LEG_CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'leg-pill' + (cat === 'All' ? ' leg-pill--active' : '');
    btn.dataset.category = cat;
    const icon = cat !== 'All' ? (LEG_CATEGORY_ICONS[cat] || '') : '';
    btn.innerHTML = `${icon}<span>${cat}</span>`;
    catContainer.appendChild(btn);
  });

  // Render status pills
  const statusContainer = panel.querySelector('#legStatusPills');
  LEG_STATUSES.forEach((st) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'leg-status-pill' + (st === 'All' ? ' leg-status-pill--active' : '');
    btn.dataset.status = st;
    const dotClass = st === 'Passed' ? 'leg-dot-passed' : st === 'Proposed' ? 'leg-dot-proposed' : 'leg-dot-all';
    btn.innerHTML = `<span class="leg-status-dot ${dotClass}"></span>${st}`;
    statusContainer.appendChild(btn);
  });

  // Wire up event handlers
  wireUpPanelEvents(panel, stateData);

  // Initial render
  renderFilteredCards(stateData);

  // Animate panel in
  if (isNewPanel) {
    panel.classList.add('leg-panel-active');
  } else {
    // Cross-fade: panel already visible, just fade content
    panel.style.opacity = '0';
    requestAnimationFrame(() => {
      panel.style.transition = 'opacity 200ms ease';
      panel.style.opacity = '1';
      setTimeout(() => { panel.style.transition = ''; }, 250);
    });
  }

  // Scroll panel into view
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function wireUpPanelEvents(panel, stateData) {
  // Category pills
  panel.querySelector('#legCategoryPills').addEventListener('click', (e) => {
    const btn = e.target.closest('.leg-pill');
    if (!btn) return;
    const cat = btn.dataset.category;
    if (cat === 'All') {
      legPanelState.categories.clear();
      panel.querySelectorAll('.leg-pill').forEach((b) => b.classList.remove('leg-pill--active'));
      btn.classList.add('leg-pill--active');
    } else {
      panel.querySelector('.leg-pill[data-category="All"]').classList.remove('leg-pill--active');
      btn.classList.toggle('leg-pill--active');
      if (btn.classList.contains('leg-pill--active')) {
        legPanelState.categories.add(cat);
      } else {
        legPanelState.categories.delete(cat);
      }
      if (legPanelState.categories.size === 0) {
        panel.querySelector('.leg-pill[data-category="All"]').classList.add('leg-pill--active');
      }
    }
    legPanelState.page = 1;
    renderFilteredCards(stateData);
  });

  // Status pills
  panel.querySelector('#legStatusPills').addEventListener('click', (e) => {
    const btn = e.target.closest('.leg-status-pill');
    if (!btn) return;
    panel.querySelectorAll('.leg-status-pill').forEach((b) => b.classList.remove('leg-status-pill--active'));
    btn.classList.add('leg-status-pill--active');
    legPanelState.status = btn.dataset.status;
    legPanelState.page = 1;
    renderFilteredCards(stateData);
  });

  // Sort
  panel.querySelector('#legPanelSort').addEventListener('change', (e) => {
    legPanelState.sort = e.target.value;
    legPanelState.page = 1;
    renderFilteredCards(stateData);
  });

  // Search (debounced)
  let searchTimer;
  panel.querySelector('#legPanelSearch').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      legPanelState.search = e.target.value.trim().toLowerCase();
      legPanelState.page = 1;
      renderFilteredCards(stateData);
    }, 200);
  });

  // Back to map
  panel.querySelector('[data-leg-back]').addEventListener('click', () => {
    clearMapSelection();
  });

  // Active filters — clear all / individual
  panel.querySelector('#legActiveFilters').addEventListener('click', (e) => {
    if (e.target.closest('.leg-filter-clear-all')) {
      legPanelState.categories.clear();
      legPanelState.status = 'All';
      legPanelState.search = '';
      panel.querySelector('#legPanelSearch').value = '';
      panel.querySelectorAll('.leg-pill').forEach((b) => b.classList.remove('leg-pill--active'));
      panel.querySelector('.leg-pill[data-category="All"]').classList.add('leg-pill--active');
      panel.querySelectorAll('.leg-status-pill').forEach((b) => b.classList.remove('leg-status-pill--active'));
      panel.querySelector('.leg-status-pill[data-status="All"]').classList.add('leg-status-pill--active');
      legPanelState.page = 1;
      renderFilteredCards(stateData);
      return;
    }
    const tag = e.target.closest('.leg-filter-tag');
    if (!tag) return;
    const type = tag.dataset.filterType;
    const val = tag.dataset.filterValue;
    if (type === 'category') {
      legPanelState.categories.delete(val);
      const pillBtn = panel.querySelector(`.leg-pill[data-category="${val}"]`);
      if (pillBtn) pillBtn.classList.remove('leg-pill--active');
      if (legPanelState.categories.size === 0) {
        panel.querySelector('.leg-pill[data-category="All"]').classList.add('leg-pill--active');
      }
    } else if (type === 'status') {
      legPanelState.status = 'All';
      panel.querySelectorAll('.leg-status-pill').forEach((b) => b.classList.remove('leg-status-pill--active'));
      panel.querySelector('.leg-status-pill[data-status="All"]').classList.add('leg-status-pill--active');
    }
    legPanelState.page = 1;
    renderFilteredCards(stateData);
  });

  // Image error fallback (replaces inline onerror)
  panel.addEventListener('error', (e) => {
    if (e.target.hasAttribute('data-hide-on-error')) e.target.style.display = 'none';
  }, true);

  // Card expand/collapse + load more (delegated)
  panel.addEventListener('click', (e) => {
    // Load more button
    if (e.target.closest('.leg-load-more-btn')) {
      legPanelState.page++;
      renderFilteredCards(stateData, true);
      return;
    }
    // Card expand (skip links)
    const card = e.target.closest('.leg-card');
    if (card && !e.target.closest('a')) {
      const id = card.dataset.billId;
      if (legPanelState.expanded.has(id)) {
        legPanelState.expanded.delete(id);
        card.classList.remove('leg-card--expanded');
      } else {
        legPanelState.expanded.add(id);
        card.classList.add('leg-card--expanded');
      }
    }
  });
}

function getFilteredBills(stateData) {
  let bills = [...stateData.bills];
  const { categories, status, search, sort } = legPanelState;

  // Category filter
  if (categories.size > 0) {
    bills = bills.filter((b) => categories.has(b.category));
  }
  // Status filter
  if (status !== 'All') {
    bills = bills.filter((b) => b.status === status.toLowerCase());
  }
  // Search filter
  if (search) {
    bills = bills.filter((b) =>
      b.title.toLowerCase().includes(search) ||
      b.id.toLowerCase().includes(search) ||
      b.sponsor.toLowerCase().includes(search) ||
      b.summary.toLowerCase().includes(search)
    );
  }
  // Sort
  switch (sort) {
    case 'newest': bills.sort((a, b) => new Date(b.introduced) - new Date(a.introduced)); break;
    case 'oldest': bills.sort((a, b) => new Date(a.introduced) - new Date(b.introduced)); break;
    case 'category': bills.sort((a, b) => a.category.localeCompare(b.category)); break;
    case 'status': bills.sort((a, b) => a.status.localeCompare(b.status)); break;
  }
  return bills;
}

function renderFilteredCards(stateData, append = false) {
  const grid = document.getElementById('legCardsGrid');
  const loadMoreWrap = document.getElementById('legLoadMoreWrap');
  const countEl = document.getElementById('legSearchCount');
  const filtersEl = document.getElementById('legActiveFilters');
  if (!grid) return;

  const filtered = getFilteredBills(stateData);
  const total = stateData.bills.length;
  const visible = Math.min(filtered.length, legPanelState.page * LEG_PAGE_SIZE);

  // Update search count
  if (countEl) {
    countEl.textContent = filtered.length !== total ? `Showing ${Math.min(visible, filtered.length)} of ${total} bills` : '';
  }

  // Update active filters strip
  if (filtersEl) {
    const tags = [];
    for (const cat of legPanelState.categories) {
      tags.push(`<button class="leg-filter-tag" data-filter-type="category" data-filter-value="${cat}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>${cat}</button>`);
    }
    if (legPanelState.status !== 'All') {
      tags.push(`<button class="leg-filter-tag" data-filter-type="status" data-filter-value="${legPanelState.status}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>${legPanelState.status}</button>`);
    }
    if (tags.length) {
      tags.push('<button class="leg-filter-clear-all">Clear All</button>');
    }
    filtersEl.innerHTML = tags.join('');
  }

  // Empty state
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="leg-panel-empty">
        <svg class="leg-panel-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m3 10 4-6h10l4 6-4 6H7z"/><path d="M12 10v.01"/></svg>
        <p class="leg-panel-empty-heading">No legislation found</p>
        <p class="leg-panel-empty-sub">matching your current filters.</p>
        <button class="leg-pill leg-pill--active leg-filter-clear-all" type="button">Clear All Filters</button>
      </div>`;
    if (loadMoreWrap) loadMoreWrap.innerHTML = '';
    return;
  }

  // Render cards
  const billsToShow = filtered.slice(0, visible);
  const startIdx = append ? (legPanelState.page - 1) * LEG_PAGE_SIZE : 0;

  if (!append) grid.innerHTML = '';

  billsToShow.slice(append ? startIdx : 0).forEach((bill, i) => {
    const card = document.createElement('div');
    card.className = 'leg-card' + (legPanelState.expanded.has(bill.id) ? ' leg-card--expanded' : '');
    card.dataset.billId = bill.id;
    if (append) card.style.animationDelay = `${i * 30}ms`;

    const isPassed = bill.status === 'passed';
    const statusClass = isPassed ? 'leg-badge-passed' : 'leg-badge-proposed';
    const statusLabel = isPassed ? 'PASSED' : 'PROPOSED';
    const dateLabel = isPassed && bill.enacted ? `Enacted: ${fmtDate(bill.enacted)}` : `Introduced: ${fmtDate(bill.introduced)}`;
    const summaryShort = bill.summary.length > 120 ? bill.summary.slice(0, 120) + '...' : bill.summary;
    const icon = LEG_CATEGORY_ICONS[bill.category] || LEG_CATEGORY_ICONS['Other'];

    const esc = escapeHtml;
    card.innerHTML = `
      <div class="leg-card-top">
        <span class="leg-card-bill-num">${esc(bill.id)}</span>
        <span class="leg-card-status ${statusClass}">${statusLabel}</span>
      </div>
      <h3 class="leg-card-title">${esc(bill.title)}</h3>
      <div class="leg-card-meta">
        <span class="leg-card-cat">${icon}<span>${esc(bill.category)}</span></span>
        <span class="leg-card-date">${dateLabel}</span>
      </div>
      <p class="leg-card-summary">${esc(summaryShort)}</p>
      <div class="leg-card-expanded-content">
        <p class="leg-card-full-summary">${esc(bill.summary)}</p>
        <div class="leg-card-detail-grid">
          <div class="leg-card-detail"><span class="leg-card-detail-label">Sponsor</span><span>${esc(bill.sponsor)}</span></div>
          <div class="leg-card-detail"><span class="leg-card-detail-label">Introduced</span><span>${fmtDate(bill.introduced)}</span></div>
          <div class="leg-card-detail"><span class="leg-card-detail-label">Status</span><span>${isPassed && bill.enacted ? `Passed → Enacted ${fmtDate(bill.enacted)}` : 'Proposed'}</span></div>
        </div>
        ${bill.keyProvisions && bill.keyProvisions.length ? `
          <div class="leg-card-provisions">
            <div class="leg-card-provisions-title">Key Provisions</div>
            <ul>${bill.keyProvisions.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
          </div>` : ''}
        ${bill.fullTextUrl ? `<a href="${esc(bill.fullTextUrl)}" target="_blank" rel="noopener noreferrer" class="leg-card-link">Read Full Text <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></a>` : ''}
      </div>
      <div class="leg-card-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div>
    `;
    card.style.setProperty('--status-color', isPassed ? 'var(--leg-passed)' : 'var(--leg-proposed)');
    grid.appendChild(card);
  });

  // Load more button
  if (loadMoreWrap) {
    const remaining = filtered.length - visible;
    if (remaining > 0) {
      loadMoreWrap.innerHTML = `<button class="leg-load-more-btn" type="button">Load ${Math.min(LEG_PAGE_SIZE, remaining)} More Bills (${remaining} remaining)</button>`;
    } else {
      loadMoreWrap.innerHTML = '';
    }
  }
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
