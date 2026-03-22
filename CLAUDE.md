# The-Current — Project Context for Claude

## Project overview
RSS-powered intelligence briefing platform. Fetches 135 sources (104 enabled) across 3 tiers, deduplicates/clusters stories, enriches top stories with AI (Claude Opus 4.6), and serves a daily executive briefing. Hosted on Render (render.yaml), with GitHub Pages for static assets.
Repository: github.com/TonyRaviolli/The-Current

## Engineering standards
All code must follow the techniques in elite-web-techniques-instructions.md.
Apply those standards to any new or modified code without being asked.

### Elite Techniques Audit (all 10 implemented)
| # | Technique | Status | Implementation |
|---|-----------|--------|----------------|
| T1 | Design Tokens | DONE | Full `:root` system: surfaces, borders, text, accents, spacing, typography, radii, shadows, transitions, z-index scale, text-on-accent, hover surfaces, source-dot palette. Dark mode via `body.dark-mode` token swap. |
| T2 | Layered Shadows | DONE | 6 shadow tokens (sm/md/lg/xl/lifted/inset), glass nav panel, colored CTA shadows. |
| T3 | 3D Transforms | DONE | `perspective` on grids, `preserve-3d` on 8+ card types, `.depth-tilt` + `.tilt-shine` specular, JS mouse-tracking tilt in app.js. |
| T4 | Scroll Animations | DONE | `animation-timeline: scroll()/view()` on 15+ element types, nav shrink, scroll progress bar, parallax hero, staggered reveals. |
| T5 | View Transitions | DONE | Root fade, story-card morph, story-hero morph, `startViewTransition` wraps story nav, digest nav, filters, dark mode, page nav. |
| T6 | Micro-interactions | DONE | Full CTA system (ripple, lift, press, loading spinner), form input focus glow, nav link animated underline, market/topic/archive press feedback. |
| T7 | Container Queries | DONE | `container-type` on 6 containers, 10+ `@container` queries, fluid `clamp()` tokens on all typography (30+ values migrated from hardcoded rem). |
| T8 | Image Pipeline | DONE | `aspect-ratio` + `object-fit: cover` containers, LQIP shimmer placeholders, fade-in on load, dark mode shimmer, fallback SVG handling. |
| T9 | Core Web Vitals | DONE | Inline critical CSS in `<head>`, `content-visibility: auto` on 10+ below-fold sections, `min-height` on 6 async containers, Google Fonts `display=swap`. |
| T10 | Design Selectors | DONE | `*:focus-visible` keyboard-only rings, `:where()` resets, `:is()` consolidation, `:has()` for saved cards / form validation / market tile state. |

### Remaining polish items
- Inline `<style>` in index.html uses hardcoded `#f8f9fb`/`#1a2332` instead of CSS tokens
- `dark-mode-toggle` uses `border-radius: 6px` instead of `var(--radius-sm)`
- A few mobile-specific media query font-sizes remain hardcoded (0.6rem, 0.65rem, 1.6rem) — intentionally below clamp() floor values
- 5 consolidated responsive breakpoints at 1100/900/640/480/375px plus `prefers-reduced-motion` and `prefers-contrast:more`

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
│   └── styles.css   (201KB)   # Full stylesheet — dark abyss theme, gold/teal accents
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
