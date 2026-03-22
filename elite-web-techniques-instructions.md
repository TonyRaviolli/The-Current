# Elite Website Engineering Instructions for Claude

## How to Use This Document

Paste this entire document into any Claude conversation alongside your existing code.
Tell Claude: *"Apply all applicable techniques from these instructions to my current code."*
Claude will audit your existing files and upgrade them systematically.

---

## TECHNIQUE 1 — CSS Custom Properties & Design Tokens

### What it is
A centralized variable system that makes every color, spacing value, font size, and radius
consistent across the entire site. Changing one variable rebrands everything.

### Why it matters
Without tokens, color values are copy-pasted across dozens of files. Tokens make the site
coherent, themeable (dark mode in ~10 lines), and maintainable.

### Implementation

Define all tokens in `:root` at the top of your main CSS file.

### Instructions for Claude
- Audit ALL hardcoded color hex values, pixel sizes, and magic numbers in the codebase
- Replace every instance with the appropriate token from the `:root` definition
- If a value has no matching token, add a new token to `:root` rather than leaving it hardcoded
- Ensure dark mode tokens are applied

---

## TECHNIQUE 2 — Layered Shadows & Inset Depth (3D surface quality)

### Instructions for Claude
- Replace all single `box-shadow` values with layered equivalents using 3-4 stops
- Add `inset` shadows to button `:active` states
- Add `backdrop-filter` to any overlay, modal, nav, or sticky header element
- Add colored shadows to primary CTA buttons
- Ensure `transform: translateY()` pairs with shadow transitions on interactive cards

---

## TECHNIQUE 3 — CSS 3D Transforms & Perspective (True depth)

### Instructions for Claude
- Add `[data-tilt]` attributes and tilt JS to feature/article/project cards
- Add `perspective` to grid/flex containers whose children should feel 3D
- Use `translateZ` on text/badge elements inside tilt cards for floating labels
- Add stacked card pseudo-elements to testimonial/quote cards

---

## TECHNIQUE 4 — Scroll-Driven Animations (Native CSS, Zero JS)

### Instructions for Claude
- Add `class="reveal"` to every section heading, article card, and feature block
- Wrap grid children in `class="reveal-group"` for staggered entry
- Add `.scroll-progress` bar to site nav for article pages
- Apply sticky nav shrink animation to main navigation
- Apply parallax scroll to full-width hero images
- Always include `prefers-reduced-motion` override block

---

## TECHNIQUE 5 — View Transitions API (Page-to-page morphing)

### Instructions for Claude
- Add link-click interceptor to main JS file
- Assign `view-transition-name` to article cards and matching hero elements
- Apply custom `::view-transition-old/new` animations
- Wrap all tab/filter/accordion state changes in `startViewTransition`
- Include feature-detect guard everywhere

---

## TECHNIQUE 6 — Micro-interactions & Purposeful Animation

### Instructions for Claude
- Apply full button interaction system to ALL buttons
- Replace checkbox toggles with morphing toggle CSS
- Add focus-glow to all inputs, textareas, selects
- Replace underline text-decoration on nav links with animated underline
- Audit for any element with `cursor: pointer` that has no hover/active feedback

---

## TECHNIQUE 7 — Container Queries & Fluid Typography

### Instructions for Claude
- Add `container-type: inline-size` to main layout containers
- Replace all fixed `font-size: Xpx` with fluid `clamp()` tokens
- Replace hardcoded padding/margin on sections with `clamp()` values
- Apply `grid-template-rows: subgrid` to card components in grids

---

## TECHNIQUE 8 — Next-Gen Image Pipeline

### Instructions for Claude
- Replace every bare `<img>` with `<picture>` + multi-source pattern
- Add `width` and `height` to every `<img>`
- Add `loading="lazy"` to below-fold images
- Add `loading="eager"` and `fetchpriority="high"` to hero/LCP image
- Add `decoding="async"` to all images
- Add `aspect-ratio` + `object-fit: cover` to image containers
- Add `display: block` to all `<img>` elements

---

## TECHNIQUE 9 — Core Web Vitals Optimization (LCP, CLS, INP)

### Instructions for Claude
- Move above-fold styles into inline `<style>` in `<head>`
- Add `font-display: swap` to every `@font-face`
- Add `defer` to non-critical `<script>` tags
- Add `content-visibility: auto` + `contain-intrinsic-size` to below-fold sections
- Replace CSS transitions on margin/top/left/width/height with transform
- Add `min-height` to containers with async content

---

## TECHNIQUE 10 — Design System Selectors (:has, :is, :where)

### Instructions for Claude
- Replace JS class toggles with `:has()` where possible
- Consolidate verbose selector lists with `:is()`
- Add `*:focus { outline: none }` + `*:focus-visible` pattern
- Apply `:has(input:invalid)` form validation styling
- Apply `:has([aria-current="page"])` to nav items

---

*Generated for The-Current — github.com/TonyRaviolli/The-Current*
