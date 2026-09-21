# Variant A website completion — 21 September 2026

Scope: existing `codex/landing-alerts-direct` / PR #24. Preserve the variant A identity, €14.99 monthly Pro positioning, iPhone destination, existing product claims and app/backend boundaries.

## Completed

- Replaced visitor-facing review placeholders with a finished, bilingual alerts section and explicitly labelled Telegram illustration. No testimonials, ratings, live listings or delivery benchmarks invented.
- Made “How it works” a visible, linkable section; added a secondary hero route to it.
- Completed the desktop download handoff with a locally generated QR encoding the same App Store URL as the download links. The ordinary link remains the fallback.
- Added practical FAQs about cancellation and rental availability without a housing guarantee.
- Unified navigation on home, pricing, About and privacy, including mobile menu, Escape/focus handling, and usable navigation when scripts are unavailable.
- Generated complete English HTML for all four pages. `/en/` no longer redirects or needs JavaScript to show English. Localized navigation retains language, campaign parameters and fragment state.
- Added a landscape social image, localized metadata/canonicals/hreflang, robots and sitemap.
- Added deterministic locale generation and allowlisted static packaging. Vercel receives only the public site in `dist`; source, docs, tests and dependencies are excluded. Existing app/listing/email verification rewrites remain unchanged.

## Verification

- `npm run build`
- `npm test`: 37 tests plus static content/link contract.
- `BROWSER_CHANNEL=chrome npm run test:browser`: **43 scenarios passed**, including NL/EN, four routes, widths 320/390/768/1440; images, page errors, overflow, axe WCAG A/AA, menu/Escape, FAQ, sticky download, no-JS language navigation, and intercepted contact success/error.
- Browser evidence is written to `test-results/` (ignored locally, uploaded by GitHub Actions).
- Contact submissions are intercepted in browser tests: no customer/support messages sent. No purchases, account changes, app/backend edits or production merge.

## Review/access notes

- The supplied Vercel branch alias requires login in both available managed browser profiles. Protection is unchanged. Local browser verification does not imply authenticated remote interaction was verified.
- Subscription price and Telegram/push claims were retained from the requested branch, not independently validated against a new app release in this website task.
- The privacy policy's legal body is unchanged; only its navigation, localization delivery and metadata changed.

## Maintenance

Edit bilingual root HTML, then run `npm run build`. Commit generated `en/` pages. CI checks generation drift, behavior, public packaging and browser interactions. No build-time secrets or external transcription/image APIs are needed.
