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
