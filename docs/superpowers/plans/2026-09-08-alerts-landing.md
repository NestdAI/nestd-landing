# Nestd alerts landing implementation plan

> **For agentic workers:** use subagent-driven development with isolated file ownership and review. All three implementation directions were approved; do not request another design/planning approval. User visual approval is required before push.

**Goal:** implement three polished bilingual, responsive download pages for fast rental alerts.

**Architecture:** static HTML/CSS pages with a small shared language/interaction script and preserved, hardened analytics. Separate worktrees provide isolation; shared files are copied explicitly after review rather than changing any branch's base.

**Tech stack:** semantic HTML, CSS, browser JavaScript, Node built-in test runner/VM, Vercel static hosting.

**Spec:** `docs/superpowers/specs/2026-09-08-alerts-landing.md`.

## Global constraints

- Exact App Store URL: `https://apps.apple.com/nl/app/nestd/id6761392857`.
- Three branches start at f09f8ea8e5e4bbdcbc3b1cb160b346d77b872734, each with separate worktree.
- Monitor listings → deterministic filters → quick alerts → user responds. No AI, chatbot, swipes, partner promises, waitlist, invented proof or numeric speed/coverage claims.
- NL/EN and attribution preservation; no email/search preferences in analytics. No collection form on landing.
- No push before visual approval; no edits to main checkout or the Expo app.

## Tasks

### 1. Shared behavior and tests (foundation agent; A worktree)

Files: `landing.js`, `script.js`, `tests/marketing-behavior.test.mjs`, `tests/i18n-language-url-smoke.mjs`, attribution test migration, docs event reference.

Interface: implement the spec's `data-*` attributes. Keep `window.nestdAnalytics.track`, `.trackMeta`, `.getAttribution`; preserve existing attribution storage keys and campaign semantics.

- [x] Write failing tests for query/path/storage language precedence and blocked storage; live text/ARIA/meta updates; exact native CTA recognition and one event; first/current attribution; allowlisted event fields; SDK before-send sanitization of URL/referrer and nested preferences; unsafe Meta context suppression.
- [x] Run `node --test tests/marketing-behavior.test.mjs` and record expected failure before changes.
- [x] Implement shared scripts. Remove unused visual simulation/waitlist wiring from script.js; keep marketing behavior usable on legacy ancillary pages. CTA callbacks must not prevent default.
- [x] Run tests and report exact commands/results; root reviews and copies only agreed shared files to B/C.

### 2. Three homepage implementations (root A, separate agents B/C)

Files per branch: `index.html`, `landing.css`; C may add optimized image derivative with provenance of existing repository asset. No shared-script edits by page agents.

- [x] Follow the corresponding approved direction and common attribute contract. Create complete Dutch fallback HTML and English attribute copy.
- [x] Replace layered existing homepage structure and styles; avoid importing old CSS. Keep SEO description, canonical/hreflang, real links, favicon and public analytics key configuration.
- [x] Build semantic steps/example/FAQ/footer with strong whitespace and type scale. Label any illustrative alert and property image; do not invent results.
- [x] Add only meaningful page contract checks; use browser inspection for visual constraints rather than CSS-string tests.
- [x] Check mobile hierarchy, image weight, meaningful alt text, accessible focus and reduced motion.

### 3. Public supporting copy and static contract (root; A then copy)

Files: `about.html`, `pricing.html`, `support.css`, limited `privacy.html`/`i18n.js` corrections, `app/index.html`, `listing/index.html`, `verified/index.html`, `tests/static-landing-copy-smoke.mjs`.

- [x] Replace obsolete about/pricing marketing with concise bilingual live alerts copy and direct downloads. Preserve contact and privacy destinations; do not invent new prices or subscription entitlements.
- [x] Fix existing wrong App Store IDs in publicly reachable deep-link and verification fallback pages. Preserve route/deep-link behavior.
- [x] Remove obsolete AI descriptions/title overrides that remain publicly reachable, including privacy improvement wording; preserve legal policy substance.
- [x] Replace tests that required AI/Duo hero structure with a static contract for CTA link correctness, absence of removed product claims, translation parity, asset references and absence of forms/fake proof.

### 4. Integration, quality and local review

- [x] Run all targeted Node tests in each worktree and validate local links/assets.
- [x] Serve A/B/C at separate localhost ports. Browser checks: desktop and mobile, both languages, FAQ/links, live metadata updates, no overflow and no observed console errors. Review reduced-motion CSS and zoom-permitting viewport configuration; native OS emulation/text zoom limitations are recorded in the verification note.
- [x] Read actual final analytics payloads with test harness SDK enrichment cases; confirm a click is not claimed as an installation and no live signup/request is sent.
- [x] Independent review of spec and code using a diff artifact. Resolve important findings and rerun only affected checks.
- [x] Save desktop/mobile visual proof and open a local comparison entry point. Commit verified work locally; leave branches unpushed.
- [ ] Obtain user visual approval of the concrete local results. After approval only, push and obtain three Vercel Preview URLs.

## Progress

- Baseline: all three original smoke scripts passed at f09f8ea in the isolated A worktree.
- Isolation: `wt` unavailable in login and interactive shells; git worktree fallback created A/B/C in the established external worktree directory.
- Parallel implementation is safe because homepage agents own separate worktrees and the foundation agent owns disjoint files in A.
