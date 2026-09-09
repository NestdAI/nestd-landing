# Nestd: fresh-start landing design

## Provenance

- Branch: `feat/landing-fresh-start-20260909`.
- Created directly from freshly fetched `origin/main` at `f09f8ea8e5e4bbdcbc3b1cb160b346d77b872734` on 9 September 2026.
- The rejected PR #22 branch/worktree was not read as a design base, edited or reset.
- Live Nestd home and About, Stekkies, Rentbird and RentSlam were independently inspected before implementation.

## Design

An editorial housing identity: oversized Manrope typography, warm off-white and charcoal surfaces, coral details, Amsterdam canal photography, a single honestly labelled alert illustration, generous spacing and a numbered search journey. No phone-dashboard hero, testimonials without evidence, fake live listings or feature-card wall.

Copy starts with the actual rental-search frustration: repeated refreshing, city/budget/rooms/area, relevant alerts and responding through the provider. Nestd is a paid iPhone app. On 9 September Hicham confirmed the offer: first week free, then €19.99/month. This supersedes the initial price-unspecified draft; app/store billing configuration still needs release verification. Muba B.V. appears only in legal/footer context.

About is a substantial narrative: the search ritual, why Nestd reverses it, what remains the renter's choice, realistic limits, guiding principles and an actual contact link. No invented founders, milestones or users.

## Refinement — 9 September, afternoon

- Proper native radio theme control: system/light/dark icons, keyboard navigation, persistent choice and cross-tab synchronization.
- Finite hero/alert animation and progressive scroll entrances. Content is visible without scripts; reduced-motion disables/cancels animation. No looping motion.
- Confirmed pricing/trial on home, pricing, FAQ and CTA notes in both languages.
- Founder premise supplied by Hicham: a student and a young professional with personal rental-search difficulty. Editorial story uses that premise without fictional names, milestones or housing outcomes.
- Multi-source/filter/alert-to-provider explanation. Named source examples were checked against the app's `listingSources.ts` (21 configured sources). This is not proof of continuous source health or comparative market leadership: no “fastest” or “most platforms” assertion is published.
- Public NL App Store customer-review feed returned no entries on this check. No genuine quotes were supplied. The experience section invites feedback and links to App Store ratings; it does not fabricate testimonials or star ratings.
- Local build/static tests and full browser suite passed after this refinement, including native-radio keyboard operation and reduced-motion switching. Screenshots: `docs/polish-screenshots/`.

## Implementation

- `scripts/content.mjs`: Dutch and English copy.
- `scripts/build.mjs`: shared semantic page shell, static bilingual page generation and explicit `dist/` packaging.
- `assets/site.css`: new visual system, responsive layouts and light/dark/system themes.
- `assets/site.js`: theme preference, explicit language-query compatibility and intent-only CTA analytics.
- `assets/analytics.js`: existing privacy-aware attribution and marketing analytics core, with explicit English-page allowlist extension.
- Generated root HTML and `/en/` pages are committed so generated diffs remain reviewable. Run `npm run build` after source edits.
- Vercel `outputDirectory: dist` overrides its historical project default. Existing `/listing/:id`, `/app`, email-verification rewrites and `.well-known` assets are preserved. No production setting/protection changes.
- Legacy utility-route App Store links are corrected to `https://apps.apple.com/nl/app/nestd/id6761392857` without changing utility behavior.
- The existing privacy policy's substantive commitments are retained with a new shared, bilingual shell. Its inherited WhatsApp/waitlist processing references need separate product/legal reconciliation; this redesign does not invent a processing policy.

## Verification

Run `npm ci`, `npm run build`, `npm test`, `npm run test:browser`. Browser checks use installed Chrome locally and Playwright Chromium in CI.

Browser coverage: 64 page/viewport/theme combinations (1440, 768, 390 and 320px), 16 WCAG A/AA axe scans, 8 no-JavaScript page routes, local links, keyboard FAQ, native FAQ without JS, cross-page/reload/system theme preference, query and path language navigation, campaign preservation and App Store click intent. Third-party analytics endpoints are blocked during browser QA; provider-side delivery is not claimed.

Full-page screenshots of live before and local after are retained in the parent workspace report directory `reports/nestd-fresh-start-2026-09-09/`. They were visually inspected in desktop/mobile light/dark. Tests are technical safeguards, not a replacement for human design approval.

## Asset provenance

- Existing Nestd logo and app icon retained.
- Amsterdam photo: https://images.unsplash.com/photo-1512470876302-972faa2aa9a4. Downloaded 9 September 2026 under the Unsplash license: https://unsplash.com/license. Atmospheric photography, not a rental listing or customer home.
- Manrope, locally hosted from Google Fonts: https://github.com/google/fonts/tree/main/ofl/manrope. SIL Open Font License included at `assets/manrope-LICENSE.txt`.
