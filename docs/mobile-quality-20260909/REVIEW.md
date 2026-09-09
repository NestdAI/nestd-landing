# Mobile quality review — 9 September 2026

## Findings and changes

- Decorative Unicode stars, house/target/check symbols created inconsistent visual weight. Replaced marketing symbols with a shared inline SVG line-icon system; removed large decorative closing star and mobile phone-stage chip. Original app screenshot remains faithful and unchanged.
- Mobile hero text and captions were small. Raised lead to 16px and supporting captions to 12px; 44px navigation/theme targets, 48px download CTA. Retained Nestd colors, both themes, About, actual app-preview and price/trial.
- Proof fixtures formed a long stack with a redundant experience invitation before them. Preview now shows one experience/carousel section, native horizontal scroll/snap, visible next-card edge, previous/next, direct navigation dots, current position and keyboard arrows/Home/End. No autoplay, focus stealing or interception of vertical touch scroll. Without JS the track still scrolls; reduced motion uses instant navigation. Real production feedback invitation retained.
- Timing rows now share a linear visual scale, distinguish the fictional example values, and show required measurement context. No competitor performance claim or rating schema added.
- Review cards have portrait placeholders and an image brief, not fake customer headshots. Visible fictional labels and production exclusion retained.

## Filling the slots

Edit `scripts/preview-proof.mjs`:
- `activeUsers`: replace only with a verified dated active-user metric.
- `timings` and `timingSeconds`: labels and numeric seconds on the same scale (keep aligned); compare the same listings, publication-to-device receipt, identical period and define median/p95/sample size before publishing real benchmarks.
- `reviews.nl` / `reviews.en`: reviewer display name and approved quote; placeholder city/search context lives in the renderer.
- `portraits`: add approved square portrait files under `assets/`, then set each `src` (e.g. `/assets/review-01.webp`) and accurate `alt`. Minimum 600×600px, natural light, face centered, no screenshots/text overlays. Get permission to publish; no stock portraits represented as customers.
- `VERCEL_ENV=production` or `NESTD_HIDE_PROOF_PREVIEW=1` still excludes all proof fixtures, including the review carousel. Promoting real data is separate from this design preview.

## Evidence

- Build + three existing static/i18n/attribution smoke tests passed.
- Browser suite: 64 viewport/theme checks, 16 full-page axe scans, eight no-JS routes; native FAQ open/close/reversal, persistent themes, attribution/store intent and local links passed. Added carousel next, dots, keyboard Home/End, scroll updates and desktop return-from-last regression.
- Additional 8 narrow (320px) mobile timing/carousel axe scans across NL/EN × light/dark passed; reduced-motion next/previous passed in both locales/themes.
- Production build independently checked: no fictional proof/carousel in NL/EN; normal build restored afterwards.
- Images here show final mobile 390/320 light/dark, desktop review carousel, timing cards and full mobile pages, visually inspected. Browser interaction verified locally, not authenticated Vercel.
- No app/backend changes, real reviews, messages, purchases, merge or production release.
