# The-Current — Project Context for Claude

## Project overview
RSS-powered intelligence briefing platform. Fetches 135 sources (104 enabled) across 3 tiers, deduplicates/clusters stories, enriches top stories with AI (Claude Opus 4.6), and serves a daily executive briefing. Hosted on Render (render.yaml), with GitHub Pages for static assets.
Repository: github.com/TonyRaviolli/The-Current

## Engineering standards
All code must follow the techniques in elite-web-techniques-instructions.md.
Apply those standards to any new or modified code without being asked.

### Front-End Overhaul (8-stage redesign in progress)
**Master prompt:** See the user's "SENIOR FRONT-END DEVELOPER MASTER PROMPT v2" for full stage definitions and 10 technique specs.

#### Completed stages
| Stage | Techniques | Commit | Summary |
|-------|-----------|--------|---------|
| 1 | T02, T08 | `b5d3c93` | `@layer` cascade (7 layers: reset/tokens/base/layout/components/utilities/overrides), OKLCH color tokens (33 values), dark mode purge (all CSS/HTML/JS), hardcoded hex→token replacement |
| 2 | T03, T07 | `415d444` | Playfair Display + Source Serif 4 + Inter font system, fluid clamp() audit (13 hardcoded→token), drop caps, letter-spacing/line-height tokens, article-measure constraint |
| 3 | T07, T10 | `45572a8` | 22 OKLCH topic tokens + tint variants, `[data-category]` badge coloring system, TOPIC_PASTEL/TOPIC_VISUAL→OKLCH, shadow tokens→OKLCH, score/market/spectrum colors→OKLCH, 5 editorial components (`.dateline`, `.breaking-ticker`, `.pull-quote`, `.section-break`, `.author-card`), `<meta theme-color>` updated |
| 4 | T04, T05, T06 | `39a0999` | All transitions→design tokens (easing+duration), card hover spring physics (`--ease-spring`), `will-change` on scroll-progress/reveal/depth-tilt, view-transition durations→tokens, shimmer/loader→tokens, shadow-lift hover on story-card/top3/market-tile |
| 5 | T09 | (pending) | 10 container contexts (`container-type:inline-size`) + 16 `@container` rules, `env(safe-area-inset-*)` on nav/footer/mobile-nav (14 refs), `viewport-fit=cover`, `touch-action` on 7 scroll areas, `overscroll-behavior` on html+body+scroll containers (9 refs), `100dvh` body, 44px touch targets verified, hamburger nav verified |
| 6 | T01 | (pending) | `--golden-major:7fr/--golden-minor:5fr` tokens (φ ratio), hero-inner 7fr/5fr grid, story-list `auto-fill minmax(300px,1fr)`, top3-grid `subgrid` card alignment (6-row span + fallback), `.section-title::before` gold accent rule, 4 `.section-break` dividers in homepage HTML, all main/sidebar grids→golden ratio tokens |

#### Current state
- **Next stage:** 7 — Article deep polish
- **CSS architecture:** `@layer reset, tokens, base, layout, components, utilities, overrides;` (first line of styles.css)
- **Layout system:** Golden ratio `--golden-major:7fr / --golden-minor:5fr` tokens used for hero, stories-grid, story-grid, contact-layout, hero-brief-grid. Story-list uses `repeat(auto-fill, minmax(300px, 1fr))` auto-flowing grid.
- **Container queries:** 10 container contexts (feed, sidebar, archive, top3, legis, market, hero, topics, contact, about) with 16 `@container` rules.
- **Subgrid:** `grid-template-rows: subgrid` on `.top3-card` (6-row span) with `@supports not` flexbox fallback.
- **Safe areas:** `env(safe-area-inset-*)` on nav (top+sides), footer (bottom+sides), mobile nav (all 4 edges), container inline padding. `viewport-fit=cover` on `<meta viewport>`.
- **Touch:** `touch-action:pan-x` + `overscroll-behavior-x:contain` on 7 horizontal scroll areas. `overscroll-behavior:none` on html. 44px/48px touch targets throughout.
- **Color system:** Full OKLCH everywhere. 22 topic color tokens + 22 tint tokens. `[data-category]` attribute system for category-colored badges.
- **Font system:** `--font-display` (Playfair Display), `--font-body` (Source Serif 4), `--font-ui` (Inter), `--font-mono` (JetBrains Mono).
- **Dark mode:** Completely removed. Zero references in any file. Light mode only.
- **Typography:** Fluid `clamp()` tokens for all sizes. `--leading-*` (4), `--tracking-*` (5), `--article-measure: 68ch`. Drop cap on `.story-section > p:first-of-type::first-letter`.
- **Easing:** `--ease-out-expo`, `--ease-in-out-circ`, `--ease-spring`, `--ease-snap` + duration tokens.
- **Editorial:** `.dateline`, `.breaking-ticker`, `.pull-quote`, `.section-break` (rule with center icon, also `--plain` variant), `.author-card`. Section-break dividers between hero/top3/market/feed.
- **Section headers:** `.section-title::before` gold accent rule, mono font, uppercase tracking.
- **Motion:** All transitions use design tokens (easing + duration). Card hovers use `--ease-spring` with `--dur-base`. `will-change` on scroll-progress, reveal, depth-tilt. Scroll-driven animation + IntersectionObserver fallback for `.reveal`.

#### Remaining stages (7-8)
| Stage | Focus | Key deliverables |
|-------|-------|-----------------|
| 7 | Article deep polish | Article typography, bylines, reading progress, pull quotes, author card, figcaptions, lazy images |
| 8 | Final audit & deploy | Lighthouse audit (Perf≥88, A11y≥95), accessibility fixes, `<meta description>`, `<link canonical>`, real device testing, push to Render |

### Remaining polish items
- A few mobile-specific media query font-sizes remain hardcoded (0.6rem, 0.65rem, 1.6rem) — intentionally below clamp() floor values
- 5 consolidated responsive breakpoints at 1100/900/640/480/375px plus `prefers-reduced-motion` and `prefers-contrast:more`
- 3 hardcoded hex values remain in `prefers-contrast:more` accessibility block (intentional)

## File structure
```
├── index.html                  # Single-page app shell (45KB, template vars for SSR)
├── package.json                # ESM, 3 deps: @anthropic-ai/sdk, fast-xml-parser, marked
├── render.yaml                 # Render deployment config
├── AGENTS.md                   # Brand + UI + engineering principles
│
├── assets/                     # Frontend — vanilla JS, no build step
│   ├── app.js       (51KB)    # Main entry: wires personalization, share, export, watches
│   ├── render.js    (100KB)   # All rendering: daily feed, story cards, digest, archive
│   ├── ui.js        (42KB)    # Visit tracking, export, copy link, keyword watches, polling
│   ├── api.js       (5.6KB)   # Fetch wrappers for all /api/* endpoints
│   ├── dateRanges.js (1.7KB)  # Date range utilities
│   └── styles.css   (185KB)   # @layer cascade, OKLCH tokens, light mode only, editorial typography
│
├── config/
│   ├── sources.json  (55KB)   # 135 RSS/API sources across tiers 1-3 (104 enabled)
│   ├── refresh.json  (1.2KB)  # Budget, scoring weights, clustering, schedule
│   └── topics.js     (637B)   # Canonical ALLOWED_TOPICS list (24 topics)
│
├── content/
│   ├── methodology.md          # Public methodology page
│   ├── weekly-briefing.md      # Weekly briefing template
│   └── government-civic-hub.md # Government/civic resources page
│
├── src/
│   ├── server.js     (921 lines) # HTTP server, all API routes, SSR, static serving
│   ├── refresh.js    (545 lines) # Orchestrator: fetch → dedup → score → cluster → enrich → persist
│   ├── site.js                    # robots.txt, sitemap.xml, site-feed.xml generation
│   └── lib/
│       ├── ai.js              # Claude API wrapper (brief, whyItMatters, whatsNext, topics, market intel)
│       ├── archive.js         # Rolling 365-day archive (data/archive.json)
│       ├── cluster.js         # Jaccard + entity overlap clustering with O(1) signature index
│       ├── dedupe.js          # 3-pass dedup: exact URL → normalized title → Jaccard similarity
│       ├── digest.js          # Weekly digest HTML email builder
│       ├── entities.js        # Two-tier entity extraction: sync patterns + async AI
│       ├── forms.js           # Contact/source/topic form validators
│       ├── health.js          # Per-source health state machine (healthy→degraded→unstable→paused)
│       ├── http.js            # HTTP client with retry, conditional GET, circuit breaker, health recording
│       ├── logger.js          # Structured JSON logging (stdout + optional file)
│       ├── metrics.js         # Quality metrics: dedupeRatio, freshnessScore, topicSpread
│       ├── normalize.js       # normalizeUrl, normalizeTitle, jaccardSimilarity, stableId, slugify
│       ├── quotes.js          # Daily insight quotes
│       ├── rss.js             # RSS/Atom XML parser (fast-xml-parser v5), image extraction
│       ├── sanitize.js        # HTML stripping, entity decoding, control char removal
│       ├── scheduler.js       # Cron-like refresh scheduler (4x daily from refresh.json)
│       ├── score.js           # Article scoring: tier weight, recency decay, topic boosts, US priority
│       ├── search.js          # Full-text search index builder + query engine
│       ├── source-adapters.js # 7 adapters: RSS, White House, Federal Register, Congress, GovInfo, SCOTUS, FEMA
│       ├── source-history.js  # Source history profiling for backfill
│       └── store.js           # Atomic JSON read/write (tmp+rename)
│
├── scripts/
│   ├── health-check.js        # CLI health probe (exit 0/1, for pm2/Docker)
│   ├── smoke-test.js          # Full smoke test suite
│   ├── screenshot.mjs         # Playwright screenshot capture
│   └── refresh-scheduler.js   # Standalone scheduler entry
│
├── tests/
│   ├── pipeline.test.js       # 78 unit tests (normalize, score, dedupe, entities, sanitize, RSS)
│   ├── integration.test.js    # Integration tests (mock RSS pipeline + quality metrics)
│   ├── archive.test.js        # Archive persistence tests
│   ├── source-history.test.js # Source history profiling tests
│   └── source-adapters.test.js # Source adapter parsing tests
│
└── data/                       # Runtime data (gitignored)
    ├── store.json              # Current feed state
    ├── cache.json              # Source fetch cache (ETags, timestamps)
    ├── health.json             # Per-source health outcomes
    ├── archive.json            # Rolling 365-day story archive
    └── quality-YYYY-MM-DD.json # Daily quality reports
```

## Tech stack
- Node.js ESM (pure `import`/`export`, no CommonJS)
- Vanilla HTML / CSS / JavaScript — no framework, no npm on the frontend
- `@anthropic-ai/sdk` ^0.78.0 — Claude Opus 4.6 with adaptive thinking
- `fast-xml-parser` ^5.3.7 — RSS/Atom feed parsing
- `marked` ^12.0.2 — Markdown rendering for content pages
- `playwright` ^1.58.2 (devDependency) — screenshots
- Node.js built-in test runner (`node --test`)
- Render for hosting (render.yaml)

## Run commands
```bash
node src/server.js                    # Dev server on port 5173
npm test                              # All tests (110 pass)
node scripts/smoke-test.js            # Full smoke test
node scripts/health-check.js          # CLI health probe
node src/refresh.js                   # One-shot refresh
```

## API endpoints
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/feed` | GET | - | Full store (30s in-memory cache) |
| `/api/status` | GET | - | Last refresh, story count, next refresh |
| `/api/health` | GET | - | Per-source health summary |
| `/api/metrics` | GET | - | Quality metrics + latest report |
| `/api/search?q=&tier=&topic=&from=&to=` | GET | - | Cross-archive full-text search |
| `/api/archive?range=week\|month\|quarter\|all` | GET | - | Rolling archive by date range |
| `/api/archive/stats` | GET | - | Archive summary stats |
| `/api/story/:slug` | GET | - | Single story detail |
| `/api/digest/latest` | GET | - | Weekly digest |
| `/api/resources` | GET | - | Markdown content pages |
| `/api/refresh` | GET | - | Trigger refresh (guarded by in-flight lock) |
| `/api/refresh-stream` | GET | - | SSE streaming refresh with phase events |
| `/api/feed-updates` | GET | - | SSE for live feed update notifications |
| `/api/sources` | GET | Admin | List all sources with health |
| `/api/sources/history` | GET | Admin | Source history profiles |
| `/api/sources/toggle` | POST | Admin | Enable/disable a source |
| `/api/sources/add` | POST | Admin | Add new source |
| `/api/sources/:id` | DELETE | Admin | Remove source |
| `/api/scoring` | GET/POST | Admin | Read/update scoring config |
| `/api/contact` | POST | Rate-limited | Contact form |
| `/api/submit-source` | POST | Rate-limited | Source suggestion form |
| `/api/request-topic` | POST | Rate-limited | Topic request form |
| `/api/events` | POST | Rate-limited | Client analytics events (validated, 1/sec per IP) |

## Decisions made
- **Atomic writes**: store.js writes to .tmp then renames — crash-safe JSON persistence
- **Circuit breaker**: 3 failures → cooldown (30 min) before retrying a source
- **AI enrichment**: Only top 10 stories per refresh; 24h cache to avoid re-enrichment
- **Batch topic classification**: Single API call for all candidates (classifyTopicsBatch)
- **Entity-boosted clustering**: Requires both entity AND text similarity to merge
- **O(1) signature index**: normalizedTitle → cluster map for fast dedup in clustering
- **Diversity guards**: Source/region/family limits prevent one-topic domination in daily selection
- **US priority**: Domestic stories get priority; strategic international stories filtered by score threshold + direct US impact
- **Legislative priority**: Stories with Congress.gov/govinfo links and bill IDs get legislative scoring boost
- **Feed cache**: 30s in-memory stale-while-revalidate for /api/feed
- **Cache-bust hash**: MD5 of asset files injected as ?v= on all /assets/ URLs
- **Graceful degradation**: AI features return null when ANTHROPIC_API_KEY is missing; pipeline continues with sync fallbacks

## Current news sources
135 sources (104 enabled) across 3 tiers in config/sources.json, with 7 adapter types:
- **RSS** (default): Standard RSS/Atom feeds
- **whitehouse-archive**: Paginated White House press releases
- **federal-register-api**: Federal Register document API
- **congress-bills-api**: Congress.gov bill tracking API
- **govinfo-bills-api**: GovInfo collection API with per-package summaries
- **supreme-court-opinions**: SCOTUS slip opinions HTML scraper
- **fema-openfema-api**: FEMA disaster declarations API

## Known issues
1. **Frontend files are very large** — app.js (51KB), render.js (100KB), styles.css (201KB) — no minification or code splitting
2. **Search is substring-only** — `searchIndex` uses `.includes()`, no relevance ranking or fuzzy matching
3. **Rate limiter is in-memory** — resets on server restart; no persistence
4. **No CORS headers** on most endpoints (only `/api/feed-updates` has `Access-Control-Allow-Origin`)
5. **Admin auth is token-only** — simple bearer/header token, no session management
6. **Scheduler re-reads config once at startup** — config changes require server restart
7. **`dedupeArticles` is O(n²)** — Jaccard check iterates all accepted articles for each new one

## Security hardening (applied 2026-03-22)
- CSP meta tag in index.html (`default-src 'self'; script-src 'self' 'unsafe-inline'; ...`)
- All inline `onclick` handlers removed — data-attribute event delegation pattern
- `/api/events` now has rate limiting (1/sec per IP) + payload validation
- `decodeURIComponent` crash guard on `/api/sources/:id`
- `marked.parse()` wrapped in try-catch for `/api/resources`
- `site.js` uses absolute `path.join(ROOT, ...)` paths instead of CWD-relative
- All external links use `rel="noopener noreferrer"`
- XSS fix in `render.js` `onerror` attribute (quote escaping)
- HTTP→HTTPS for source URLs (BBC World, Ars Technica)

## Last audit (2026-03-22)
See AUDIT-REPORT.md for the full 5-phase audit report. 110/110 tests passing.
