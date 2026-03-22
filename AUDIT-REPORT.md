# The UnderCurrent — Full Codebase Audit Report

**Date:** 2026-03-22
**Auditor:** Claude Opus 4.6 (principal engineer audit)
**Scope:** 5-phase comprehensive audit — bugs, security, techniques, sources, performance
**Test status:** 110/110 pass (17 suites, 0 failures)

---

## Phase 1 — Full Codebase Inventory

| Category | Count | Details |
|----------|-------|---------|
| Backend source files | 24 | src/ + src/lib/ |
| Frontend JS files | 5 | assets/*.js |
| Config files | 3 | sources.json, refresh.json, topics.js |
| Test suites | 17 | 110 tests across 5 test files |
| Content pages | 3 | methodology, weekly-briefing, gov-civic-hub |
| Scripts | 4 | health-check, smoke-test, screenshot, scheduler |
| Total lines (backend) | ~4,500 | Node.js ESM |
| Total lines (frontend) | ~6,000 | Vanilla JS |
| Total lines (CSS) | ~3,000 | Single stylesheet, no build step |

---

## Phase 2 — Bug & Error Audit

### Security fixes (HIGH priority)
| # | Issue | File | Fix |
|---|-------|------|-----|
| S1 | No Content-Security-Policy | index.html | Added CSP meta tag (default-src 'self', frame-ancestors 'none') |
| S2 | XSS in onerror attribute | render.js:258 | Quote-escaped `fallbackSrc` in `onerror` handler |
| S3 | /api/events unvalidated | server.js | Added rate limiting (1/sec per IP) + payload validation (type string, max 100 chars, max 10 keys) |
| S4 | decodeURIComponent crash | server.js | Wrapped in try-catch, returns 400 on malformed encoding |
| S5 | HTTP source URLs | sources.json | BBC World + Ars Technica upgraded to HTTPS |
| S6 | site.js CWD-relative writes | site.js | Changed to absolute `path.join(ROOT, ...)` |
| S7 | robots.txt hardcoded localhost | robots.txt | Changed to relative `/sitemap.xml` |
| S8 | marked.parse() uncaught | server.js | Wrapped in try-catch for /api/resources |

### HTML fixes
| # | Issue | Fix |
|---|-------|-----|
| H1 | 13 inline `onclick` handlers in index.html | Replaced with `data-dismiss`, `data-action`, `data-nav` attributes |
| H2 | 8 inline `onclick` handlers in render.js | Replaced with `data-open-story`, `data-search-entity`, `data-toggle-breakdown` attributes |
| H3 | `role="navigation"` on `<ul>` instead of `<nav>` | Moved to `<nav>` element |
| H4 | External links missing `noreferrer` | Added `rel="noopener noreferrer"` to all 12 `target="_blank"` links in render.js |

### CSS fixes
| # | Issue | Fix |
|---|-------|-----|
| C1 | Layout-triggering animation (padding) | Changed `nav-shrink` keyframe from `padding` to `transform:scaleY()` |
| C2 | 6 redundant `image-rendering:auto` | Removed |
| C3 | Z-index war (values up to 99999) | Created 11 z-index tokens (`--z-bg` through `--z-skip`), rationalized all values |

### JS fixes
| # | Issue | Fix |
|---|-------|-----|
| J1 | All inline onclick handlers | Event delegation via `document.body.addEventListener('click', ...)` in app.js |

### Not fixed (low priority / by design)
- `dedupeArticles` O(n^2) — acceptable at current scale (~200 articles/refresh)
- In-memory rate limiter — acceptable for single-server deployment
- Admin auth token-only — acceptable for internal admin panel

---

## Phase 3 — Advanced Techniques Audit (T1–T10)

### T1: Design Tokens
**Before:** 16+ hardcoded hex colors leaked outside `:root`
**After:** Added 11 new semantic tokens:
- `--text-on-accent` (#fff) — white text on colored backgrounds
- `--bg-hover`, `--bg-body-start`, `--bg-body-end`, `--bg-refresh` — surface variants
- `--accent-teal-hover` — link hover state
- `--bg-market-tint` — market tile gradient stop
- `--source-dot-1` through `--source-dot-5` — bias spectrum palette
- All hardcoded hex values replaced with tokens

### T7: Container Queries & Fluid Typography
**Before:** 32+ hardcoded `font-size` values using fixed `rem`
**After:** Mapped to fluid `clamp()` tokens:
- `0.68rem` → `var(--text-2xs)` (14 occurrences)
- `0.70-0.76rem` → `var(--text-xs)` (12 occurrences)
- `0.82-0.9rem` → `var(--text-sm)` (6 occurrences)
- `0.95rem` → `var(--text-base)`, `1.05rem` → `var(--text-md)`, `1.15rem` → `var(--text-lg)`
- Remaining: 6 mobile-specific overrides intentionally below clamp() floor values

### T9: Core Web Vitals
**Before:** `content-visibility:auto` on 4 sections only
**After:** Expanded to 10+ sections:
- Added: `.developing-section`, `.archive-month-group`, `.topic-block-card`, `.search-results-container`, `.sidebar`
- Each with appropriate `contain-intrinsic-size` estimates

### T2, T3, T4, T5, T6, T8, T10: PASS
All fully implemented with no gaps found:
- T2: 6 layered shadow tokens, glass nav, colored CTA shadows
- T3: `perspective` on grids, `preserve-3d` on 8+ card types, JS tilt tracking
- T4: `animation-timeline: scroll()/view()` on 15+ elements
- T5: 3 `view-transition-name` values, `startViewTransition` wraps all state changes
- T6: Full CTA system (ripple, lift, press), form focus glow, animated nav underline
- T8: All generated `<img>` have width/height/loading/decoding/sizes/fallback
- T10: 4 `:has()` selectors, `:where()` resets, `:is()` consolidation, `:focus-visible` rings

---

## Phase 4 — News Source Audit & Remediation

### Source inventory
| Metric | Before | After |
|--------|--------|-------|
| Total sources | 125 | 135 |
| Enabled sources | 94 | 104 |
| Tier 1 (wire/gov) | 33 (26 enabled) | 33 (26 enabled) |
| Tier 2 (specialty) | 70 (56 enabled) | 81 (67 enabled) |
| Tier 3 (local/cartoon) | 22 (12 enabled) | 22 (12 enabled) |

### Topic coverage improvements
| Topic | Before | After | Change |
|-------|--------|-------|--------|
| tech | 6 | 10 | +4 |
| ai | 3 | 7 | +4 |
| engineering | 0 | 3 | +3 (was missing!) |
| elections | 4 | 6 | +2 |
| infrastructure | 3 | 5 | +2 |
| banking | 3 | 4 | +1 |
| science | 16 | 19 | +3 |
| cyber | 5 | 7 | +2 |
| education | 5 | 6 | +1 |
| macroeconomics | 7 | 8 | +1 |

### New sources added (11)
| Source | Type | Topics | Tier |
|--------|------|--------|------|
| WIRED AI | RSS | ai, tech, science | 2 |
| IEEE Spectrum | RSS | engineering, tech, ai, infrastructure | 2 |
| Ars Technica AI | RSS | ai, tech, cyber | 2 |
| FiveThirtyEight | RSS | elections, uspolitics, economy | 2 |
| Cook Political Report | RSS | elections, uspolitics | 2 |
| Federal Reserve Press | RSS | banking, finance, macroeconomics | 2 |
| FHWA Press Releases | RSS | infrastructure, uspolitics | 2 |
| NIST News | RSS | engineering, tech, cyber, science | 2 |
| NSF Research News | RSS | science, engineering, ai | 2 |
| Dept. of Education Press | RSS | education, uspolitics | 2 |

All 24 canonical topics now have 3+ enabled sources.

---

## Phase 5 — Quality Gates

### Test results
```
110 tests | 17 suites | 0 failures | 0 skipped
Duration: ~600ms
```

### Files modified
| File | Changes |
|------|---------|
| index.html | CSP meta tag, nav role fix, 13 onclick→data-attr |
| assets/styles.css | Z-index tokens, font-size tokens, hex→token, content-visibility expansion, animation fix |
| assets/render.js | 8 onclick→data-attr, rel="noopener noreferrer", XSS onerror fix |
| assets/app.js | Event delegation handler (data-open-story, data-search-entity, data-toggle-breakdown) |
| src/server.js | /api/events rate limiting + validation, decodeURIComponent guard, marked try-catch |
| src/site.js | Absolute paths for file writes |
| config/sources.json | 11 new sources, 2 HTTP→HTTPS fixes |
| robots.txt | Relative sitemap URL |
| CLAUDE.md | Updated with audit results |

### Remaining items (low priority)
1. Inline `<style>` in index.html still uses hardcoded `#f8f9fb`/`#1a2332`
2. `dark-mode-toggle` uses `border-radius: 6px` instead of `var(--radius-sm)`
3. Frontend files remain large (no minification) — acceptable for no-build-step architecture
4. Search is substring-only — future enhancement opportunity
5. Some disabled sources (Reuters, AP) may need URL updates when re-enabled
