# Paid rental-alert landing rework — 9 September 2026

## Competitor-informed conversion pass

Read live Stekkies, RentSlam and Rentbird on9September; all quantitative/competitive statements remain attributed assertions, not verified Nestd benchmarks. Full source comparison, implemented changes, prioritized app/platform proposals (impact/effort/measurement), and the measurement plan are in [the companion review](competitor-conversion-review-2026-09-09.md).

Implemented: a user-controlled, keyboard-accessible illustrative walkthrough replacing repeated static feature/procedure sections; clearer paid-service vs provider responsibilities on Home/Pricing; why-pay, variable-volume and provider-access FAQs; explicit post-download purchase/setup steps; fixed-step interaction analytics that do not claim conversion outcomes. No fake search input, live demo data or backend activity. Full NL/EN About and both persistent themes remain. The new scrolled-state axe regression found/fixed the light mobile sticky CTA's older, higher-specificity dark background rule. A mobile lab run also exposed a0.192 layout shift from late header enhancement; switching the fallback to the existing pre-paint JS signal and reserving appearance-control space removed it. A delayed-script regression verifies stable header geometry.

Fresh evidence in `test-artifacts/landing-conversion-2026-09-09/` covers both themes/locales desktop/mobile, About, pricing/download,320px and all walkthrough stages. Isolated walkthrough/clarity section crops omit the fixed mobile CTA to keep the entire section readable; a separate real viewport capture includes it. Prior third-pass screenshots remain available for comparison. All examples remain clearly labelled illustrations.

New tests cover all walkthrough states in both themes, keyboard arrows/Home/End, noJS full-step fallback, contrast, typed-input/form absence, intent-only event fields, clear download steps and delayed-script header geometry. Fresh final mobile Lighthouse local lab:97 Performance/100 Accessibility/100 Best Practices/100 SEO, LCP2.6s,TBT10ms,CLS0 (third-party analytics blocked; not production or delivery performance). Final full-suite results and exact-head preview verification appear in the PR/closeout. No app/platform proposals were implemented or advertised as shipped. No price question repeated, no invented amount/trial, no merge/production/protection changes.

The independent parent competitor report was subsequently read in full and reconciled in the companion review: existing PR175 search/permission/deeplink code is distinguished from released behavior, with additional first-alert and duplicate/stale-alert acceptance criteria and a comparable-speed/experiment methodology. This follow-up changes documentation only; the conversion screenshots remain representative.

## Third quality revision — first-class light/dark and a full About destination

**Scope:** Hicham explicitly requested both themes and a material About/quality pass on the same PR22. No app/backend/Sazzad changes. The earlier About route was present, but its short generic content did not make its importance clear. The previous dark-only design was incomplete for the brand. These issues are addressed in implementation, not only noted.

### Candid visual review → implemented fixes

| Finding in the second revision | Third-pass change |
| --- | --- |
| No light theme; surface colors hardcoded and phone visuals always light | Semantic light/dark surfaces, text, borders, accent contrast and product-illustration tokens. System default plus visible appearance selector with an appearance icon |
| About felt like a shorter product page | Dedicated NL/EN mission headline, original search-frustration story, mission panel, principles, audience context and company/contact details; original `#contact` remains |
| About easy to overlook behind the mobile menu | Always-visible mobile About link, in addition to desktop navigation, menu, footer and homepage company links |
| Some supporting copy too small | Increased feature, FAQ, pricing, conditions, legal-shell, support and trust text; maintained hierarchy and responsive spacing |
| Oversized mobile hierarchy and heavily rotated phones | Moderated mobile heading scale and phone rotations; restrained shadows and balanced type |
| Initial third-pass About image stretched beyond its800px source | Desktop split caption/photo composition keeps the source near native resolution; mobile uses a legible contained photo with caption |
| Pricing/download and legal pages needed equal theme treatment | Shared theme and typographic styles apply to all ten marketing/legal routes; utility app/listing fallbacks also inherit the saved appearance without adding listing analytics |

### About provenance

Reviewed original `about.html` at base `f09f8ea`. Its published origin story describes frustration with repeatedly opening housing websites, scrolling and missing listings. This narrow first-party narrative is preserved, not expanded into invented founder biographies, founding dates, team members or achievements. Its unverified housing-crisis figures, age/persona examples, affordability/comparative claims and old AI/free/partner/WhatsApp promises are not restored. Muba B.V. provider identity, existing support contact and verified App Store link are retained. Original legal disclosure strings/date remain unchanged. About metadata now uses its own mission introduction.

### Theme contract and verification

- Native, labelled **System / Light / Dark** selector on every marketing page. Choice stored under existing `nestd-theme`; System removes override. Works across routes/locales/reload and storage events. Storage denial leaves the current-page control usable.
- Blocking head `theme.js` applies a valid saved choice before stylesheet/body paint; no deferred class flip. A browser regression observes the saved theme at stylesheet insertion.
- CSS-only system preference (including live system changes) with noJS fallback. No nonfunctional theme control is shown without JavaScript; navigation, About and legal text remain available.
- Light mode uses accessible darker coral for text while retaining the original coral action color; dark mode uses brighter coral text, intentional dark card/phone surfaces and contrast-safe secondary text. This is not a background-only inversion.
- `npm run build:vercel` and7 content/contract tests pass; Vercel `dist` packaging explicitly includes `theme.js` and `themes.css`, existing rewrites/associations preserved.
- **55 browser checks pass**:40 route ×theme ×viewport checks with axe WCAG A/AA and link/layout verification, plus existing funnel checks and dedicated system/manual/persistence, pre-paint, storage-denial/keyboard, noJS both themes, prominent About, full content,320px and reduced-motion checks.
- Fresh screenshots: `test-artifacts/landing-themes-about-2026-09-09/` — home/About/pricing/download ×NL/EN ×light/dark ×desktop/mobile, hero crops and320px. Prior screenshots retained under `test-artifacts/landing-app-storefront-2026-09-09/` for before/after review. Both themes/locales and About compositions visually inspected.
- Fresh local mobile Lighthouse: **97 Performance /100 Accessibility /100 Best Practices /100 SEO**, LCP2.5s, TBT10ms, CLS0; third-party analytics blocked, simulated mobile local lab, not a production guarantee. Exact-head remote CI/preview verification is recorded in the final PR/closeout. Old scores below belong to earlier revisions.

All previous launch gates still apply: exact price/billing contract, app/store parity, legal review, protected Linear access and Vercel anonymous sharing. No invented proof, no public operational placeholders, no repeated price question, no merge/production/protection changes.

## Second visual revision — premium app storefront

Hicham requested a substantial second redesign on the same PR #22, not a copy-only update. This revision replaces the editorial/arched-photo composition with bold sans-serif hierarchy, layered native-inspired phone illustrations, light visual feature cards, a contained three-step product flow, company/purchase/support trust cards, and a verified App Store information link. Coral/black/logo branding, paid-only positioning, native FAQs, mobile CTA and desktop QR handoff remain. Home and About now use the new phone presentation; pricing, download, privacy shell and localized social cards share the revised design system.

### Visual provenance and customer-proof gates

- Read-only inspection: `pr175-product-pivot/test-artifacts/pr-175-product-pivot-2026-09-06/dashboard-after.png` and `sources-onboarding-after.png`. Native light cards, coral controls, listing images, clear filters and sans typography informed the illustrations.
- These screenshots contain a test user's name, historical inventory numbers, and unmerged app UI. They were **not copied into the website**. No app/backend file was changed. New HTML/CSS illustrations have visible NL/EN disclosures: **not app screenshots or live listings**. Example notification labels and example-home labels are visible; no invented real addresses, prices or personal data. Illustrative controls are noninteractive and excluded from the accessibility tree; surrounding explanatory content remains accessible.
- Review provenance: fresh read on 9 September of https://itunes.apple.com/nl/rss/customerreviews/id=6761392857/sortBy=mostRecent/json returned HTTP 200 and **zero customer review entries** (feed updated `2026-09-09T01:57:43-07:00`). This is specific to the NL feed, not proof that no reviews exist anywhere. No independently verified publishable reviews were available for this revision. No legacy testimonial image, rating, quote or avatar was reused.
- No verified active-user count. Listing inventory, new homes and notification rows are **not users**.
- Earlier September operational audit: 160 samples, DB-to-`notified_at` median 1.08s/p95 3.73s. This is an internal processing timestamp interval, **not source publication to device receipt**. No provider/device delivery receipts or defensible customer end-to-end benchmark were available. It is **not published as a speed claim**. No stopwatch, random counter or fake live activity.
- `content/storefront.mjs` records publication gates (`activeUsers: null`, `deliveryBenchmark: null`, `reviews: []`); no empty “pending” sections are rendered. Future proof needs a documented definition/window, provenance and permission for public use, including sample/date/median/p95 for timing.
- Public trust cues are factual: Muba B.V. provider identity, support contact, verified iPhone App Store destination, Apple purchase/management explanation. These are not implied endorsements, third-party certifications or customer reviews.

### Revision checks and visual evidence

- `npm run build:vercel`: passed, explicit `dist` packaging fix preserved; production verification rewrites unchanged.
- `npm test`: **7 passed**, including legal preservation, associations/rewrites, attribution and customer-proof/illustration regression.
- `npm run test:browser`: **28 passed**, including all ten NL/EN routes at desktop/mobile, axe WCAG A/AA, links, keyboard/Escape/skip link, native FAQs, no-JS, 320/375/768/1024px, zoom-equivalent width, reduced motion, sticky CTA and intent-only analytics. Additional illustration/trust smoke includes axe at320px.
- Fresh captures: `test-artifacts/landing-app-storefront-2026-09-09/` — NL/EN desktop/mobile home and hero, pricing/about/download desktop/mobile, menu/FAQ, feature/trust crops and320px. Visually inspected NL desktop/mobile, EN desktop/mobile, NL features/trust,320px and updated OG composition.
- Fresh local mobile Lighthouse: **98 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; LCP **2.3s**, TBT **0ms**, CLS **0**. Third-party analytics blocked, simulated mobile local lab; not a production guarantee or notification benchmark. HTML/JSON reports committed beside captures.
- Exact new price/billing period remains unresolved; paid requirement and review-before-payment explanation retained. No repeat question and no guessed amount. Store/release parity and legal review remain launch gates. Linear remains pending protected access, with no credential fallback.
- No merge, production deployment, protection change, subscription purchase or notification send. Existing authenticated-only preview is **not** a public-share URL; exact new deployment result is recorded in PR/closeout after push.

The previous implementation/validation sections below are historical where this revision supersedes them.

## Scope and branch

- Repository: `NestdAI/nestd-landing` only. No Nestd app, backend, scraper or database edits.
- Base: remote `main` at `f09f8ea` (merged PR #19), fetched on 9 September.
- Branch: `feat/paid-alerts-landing`.
- The original checkout's untracked `assets/`, `scripts/` and `docs/week-1-organic-content-backlog.md` were left untouched. Implementation uses a separate clean worktree.
- Delivery is a **draft PR**. No production merge or manual deployment is authorized or performed. A Git-integrated preview, if produced, is not a production release.

## Verified facts and claim decisions

| Topic | Evidence observed on 9 September | Implementation |
| --- | --- | --- |
| Direction | Hicham authorized paid-only rental alerts; no free variant, AI features, partner swiping or WhatsApp marketing | All marketing pages/locales, navigation, footer and metadata rebuilt accordingly |
| Live baseline | https://www.nestd.nl/ still promotes AI, free tier, WhatsApp and duo, and uses the wrong Apple ID | Existing copy is not treated as evidence for the new offer |
| iPhone destination | https://apps.apple.com/nl/app/nestd/id6761392857 returns 200, identifies Nestd, provider Muba B.V. | One verified destination in every marketing/utility CTA and locally generated QR |
| Old iPhone ID | https://apps.apple.com/nl/app/nestd/id6740091498 returns 404 | Removed from all served pages |
| Android | https://play.google.com/store/apps/details?id=nl.nestd.app&hl=en&gl=NL returns 404 | No Google Play badge, fabricated link or availability promise |
| Pricing conflict | NL App Store lists “Nestd Pro €19.99”; old landing and app locale copy say €19.95/month. Public store text does not establish the new paid-only billing contract | No invented exact price/period/trial. The pricing page explicitly states a paid subscription, with the current price, billing period and terms disclosed in the in-app App Store purchase screen. Confirm the new contract before replacing this copy with an amount |
| Purchase conditions | App source uses RevenueCat; store listing identifies in-app purchases and links the Apple standard EULA | Existing Apple EULA linked; subscription management refers to the Apple account. No invented refund, cancellation deadline, trial, guarantee or annual/monthly offer |
| Notification channels | Current source and the last audit do not establish a publicly released Telegram rental-alert path or proven device-delivery SLA | No Telegram CTA, connection promise, WhatsApp promotion, delivery timer or “fastest” claim. The app exposes available notification options; uncertain channel/platform availability is kept out of the product flow and recorded here only |
| Product/store parity | Public App Store description still advertises AI and WhatsApp/Pro. Parent owns independent product/release audit | Draft remains subject to product/release alignment. This website does not imply the app/backend was changed |
| Social proof | No verified testimonials, user counts, conversion results or comparative delivery benchmark | None fabricated or displayed |
| Visual | Optimized derivatives of existing `images/apartment-1.jpg` and logo, code-native notification illustration | No fake live inventory, match score or app screenshot. Explicit “example alert” and illustration caption |

The exact new price/billing contract and release/channel state were escalated early to the parent session while independent implementation continued.

## Overlapping PRs

- [#19](https://github.com/NestdAI/nestd-landing/pull/19) is **merged** and included in the base. Its download-funnel and attribution intent is retained; stale product claims and invalid store ID are corrected.
- [#20](https://github.com/NestdAI/nestd-landing/pull/20) remains open. The new About page incorporates its contact-form removal and preserves `#contact` plus `hello@nestd.nl`. Do not merge #20's old About markup over this redesign; it can be reconciled/superseded after review. This task does not close another contributor's PR.
- [#21](https://github.com/NestdAI/nestd-landing/pull/21) remains open and separate. Its partner-invite copy is not appropriate for the new marketing direction. Existing AASA and asset links remain byte-for-byte unchanged; production verification rewrite values are unchanged. No invite route or partner feature was enabled.

## Route and content audit

| Route | Result |
| --- | --- |
| `/`, `/en/` | Fully rendered localized hero, illustrative rental alert, value proposition, procedure, paid subscription, FAQs and download funnel |
| `/pricing.html`, `/en/pricing.html` | Paid-only offer, honest checkout-disclosed price/period, conditions, no free comparison table |
| `/about.html`, `/en/about.html` | Rental-search positioning, company/contact information, no contact form |
| `/download.html`, `/en/download.html` | Verified iPhone CTA, desktop QR handoff, clear paid requirement; no unverified platform-status copy |
| `/privacy.html`, `/en/privacy.html` | New accessible shared shell. All original legal disclosures and original update date retained. Legal-review open points remain in this report/PR, not in the product flow |
| `/features.html` | Legacy route redirects to the procedure section while preserving campaign query and language handling |
| `?lang=en`, `?lang=nl` | Old campaign links map to fully rendered locale routes while preserving UTM values and anchors |
| `/app`, `/app/*` | Explicit user-initiated app opening; no same-URL redirect loop; verified store fallback; no AI copy |
| `/listing/:id` | Preserved listing handoff, bounded/encoded custom-scheme identifier, no marketing analytics, corrected store destination |
| `/verified`, `/verify-error` | Existing auth-result behavior retained; corrected verified-page store URL, noindex/focus/reduced-motion improvements |
| `/verify` | Supabase email-verification rewrite unchanged; not invoked during testing |
| `admin.html` | Internal legacy admin tool untouched and disallowed in robots; robots is not authentication |
| Metadata | Localized titles/descriptions, canonicals, hreflang, OG/Twitter cards, simple factual WebSite/Organization structured data, sitemap and robots |

### Legal boundary

The old policy describes prior waitlist, AI and WhatsApp data processing. Removing those disclosures would assert an unverified change to actual data handling. They are retained, not presented as product benefits. A separate owner/legal update is still required to reconcile the policy with the released product and current analytics/consent basis. No new legal promises were invented. Automated checks prove all original NL/EN disclosure strings and dates remain present.

## Implementation and maintenance

- `content/marketing.mjs`: shared, localized marketing source and verified store constant.
- `content/privacy.json`: original NL/EN legal copy retained verbatim.
- `scripts/build-site.mjs`: deterministic static page, metadata, sitemap and local QR generation.
- `scripts/build-utility-pages.mjs`, `deeplink.js`: app/listing fallbacks and explicit app-open behavior.
- `styles.css`: shared responsive brand/layout, visible focus, native FAQ controls and reduced-motion support. No runtime UI framework or animation library.
- `script.js`: retained analytics attribution core, explicit navigation, section/FAQ/CTA tracking and unobtrusive mobile sticky CTA. No fake purchase/download-success event.
- `i18n.js`: compatibility routing for legacy language queries. Both actual locales work without JavaScript.
- `scripts/capture-evidence.mjs`: reproducible responsive screenshots and code-native social card rendering. It blocks analytics requests.
- `npm run build`, `npm test`, `npm run test:browser`, `npm run preview` are the supported commands. Local tests use installed Chrome; CI installs Playwright Chromium.
- GitHub Actions validates generated output, content/attribution behavior and browser coverage on PRs. No deployment job was added.

## Validation

- Deterministic static build succeeds.
- Content/attribution tests: **5 passed**, including preserved first/current-touch attribution, paid-only claims, legal parity, unchanged verification routes/associations and private listing fallback.
- Browser coverage: **27 passed** (26-test main suite plus the additional legacy-route test), including all ten marketing/legal routes at 390px and 1440px; internal links and anchors; consistent store destinations; feature/verification/AASA routes; no page JavaScript errors; axe WCAG A/AA scans; keyboard skip/menu/Escape/FAQ; no-JavaScript usability; language campaign preservation; 320/375/768/1024px and 200%-zoom-equivalent layout; reduced motion; sticky CTA visibility; intent-only conversion tracking.
- First browser pass caught mobile decorative-ring overflow. Fixed by clipping only the illustration stage; subsequent checks pass without hiding document overflow.
- Final mobile Lighthouse lab run (local preview, third-party analytics blocked): **Performance 97, Accessibility 100, Best Practices 100, SEO 100**; LCP 2.6s. Original brand fonts are self-hosted under their OFL licenses, responsive WebP imagery replaces the 93KB hero JPEG on served pages, and the navigation icon is 9.6KB instead of 192KB.
- Lighthouse reports and final responsive captures are stored under `test-artifacts/landing-2026-09-09/`. Local lab measurements are not production guarantees.
- A real device install, subscription purchase, notification delivery, store release and production deployment are **not** claimed or exercised.

## Review evidence

- `home-desktop-nl-hero.png`, `home-mobile-nl-hero.png`, `home-desktop-en-hero.png`, `home-mobile-en-hero.png`
- `home-desktop-nl.png`, `home-mobile-nl.png`, `home-desktop-en.png`, `home-mobile-en.png`
- `pricing-desktop.png`, `pricing-mobile.png`, `about-desktop.png`, `about-mobile.png`
- `download-desktop.png`, `download-mobile.png`, `mobile-menu.png`, `mobile-faq.png`

All files above are in `test-artifacts/landing-2026-09-09/`.

## Tracking and release gates

- Linear read attempted through the gateway environment; returned `LINEAR_AUTH_UNAVAILABLE`. The protected store has no entries. No credential was requested or exposed. Applicable English ticket update is pending the parent authenticated session; no unrelated ticket was changed.
- Before production: product owner reviews positioning and the actual in-app paid contract; resolves store-description/product parity and legal disclosures; reconciles overlapping #20/#21; approves this draft. No merge or deployment is performed by this task.

### Remote delivery checkpoint

- Draft PR: https://github.com/NestdAI/nestd-landing/pull/22
- Initial pushed implementation: `686c698f0b42c08652a50fef0b3b0dc9c7749403`.
- GitHub Actions validation passed on Linux Chromium: https://github.com/NestdAI/nestd-landing/actions/runs/34328748218 (build, deterministic output, content and browser tests).
- Automatic Vercel preview failed: https://vercel.com/hichamsadikes-projects/nestd-landing/5JZ7Q5JSMuvqd5NNsxrHDiqKWbWe . This is **not a working preview**. Exact logs are inaccessible in this session: CLI has no existing credentials; managed browser requires login; existing-session attach is unavailable. The parent was asked to retrieve the exact build error. No speculative Vercel setting change or production redeploy was performed.
- Verified local interactive preview: `http://127.0.0.1:4173/`, with English at `/en/`. Committed screenshots and Lighthouse reports remain independently reviewable.
- Supplementary verification-route checks exposed duplicate noindex metadata in the old utility pages; deduplicated without changing authentication behavior. A transient host ENOSPC interrupted one extra test launch; the retry result is recorded in closeout. No unrelated app/build data was deleted.

### Parent copy clarification applied

Unverified channel/platform explanations were removed from the product flow (including Telegram/Android FAQs and the Android availability note). The procedure and FAQs use channel-neutral housing-search language. The legal-review notice was removed from the privacy-page shell; the original legal body and date are unchanged. Exact new pricing and billing period are still pending; visitors are explicitly told to review the current in-app price, billing period and terms before confirming payment. No additional price question or credential fallback was attempted. Linear remains pending protected access. No merge/deploy.


### Public-preview build fix

The new npm build emits static pages at the repository root. Inspection of the installed Vercel static builder (`@vercel/static-build`, zero-config package build) establishes a default output path of `public` when no output directory is configured; this project generates neither `public` nor `dist`. Added an explicit branch-local static build contract: `framework: null`, `npm ci --include=dev`, `npm run build:vercel`, `outputDirectory: dist`. A deterministic packaging script copies only existing public website files into `dist`, excluding source/docs/test artifacts/dependencies. Existing verification rewrites and app associations are preserved and tested. No project-wide protection or production deployment settings were changed. Successful remote preview/access remains subject to independent readback; this local diagnosis is not presented as authenticated access to the prior deployment logs.
