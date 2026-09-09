# Nestd landing

Static NL/EN rental-alert marketing site. The current direction is paid-only; historical growth documents are explicitly marked as superseded.

```sh
npm ci
npm run build
npm test
npm run test:browser
npm run preview
```

The preview is local at `http://127.0.0.1:4173`. Local browser tests use installed Google Chrome; CI installs Playwright Chromium. To capture responsive evidence while the preview is running: `node scripts/capture-evidence.mjs`.

Edit marketing copy in `content/marketing.mjs`, templates in `scripts/build-site.mjs`, and shared presentation in `styles.css`; then build and commit the generated HTML. Existing legal disclosures are preserved in `content/privacy.json` and must not be rewritten without verified policy input. The shared App Store constant also generates the desktop QR.

See [implementation evidence and release gates](docs/landing-rework-evidence.md). No app/backend changes or production deployment are part of this landing rework.

Vercel preview builds use `npm run build:vercel` and the explicit `dist` output directory in `vercel.json`. The packaging step excludes source, dependencies and test artifacts while preserving all public routes.


### Appearance and About

- `theme.js` runs synchronously in the document head so saved `nestd-theme` choices apply before paint. Missing/invalid values use the system preference; storage failure does not prevent changing the current page. The native labelled selector offers System, Light and Dark. Choosing System removes the override.
- `themes.css` owns semantic light/dark tokens, including phone illustrations, cards, purchase panels, nav and legal shell. CSS media queries follow system changes without JavaScript. Theme controls remain hidden when JavaScript is disabled; links and full content work normally.
- `content/about.mjs` contains the complete NL/EN story, mission, principles and company/contact content. The original site's search-frustration story is retained; unsupported market figures/personas and former product claims are not.
- `node scripts/capture-theme-evidence.mjs` captures both themes/locales at desktop/mobile, plus320px. Start `npm run preview` first.

### Conversion walkthrough

`content/conversion.mjs` and `scripts/conversion.mjs` own the localized demonstration and objection handling. `demo.js` progressively enhances readable static steps into accessible tabs; it makes no search/backend request. Interaction analytics contain only fixed step number and click/keyboard method. Product/platform recommendations are explicitly separate in `docs/competitor-conversion-review-2026-09-09.md`.
