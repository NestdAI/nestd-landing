# Paid rental-alert landing rework — 9 September 2026

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
| Notification channels | Current source and the last audit do not establish a publicly released Telegram rental-alert path or proven device-delivery SLA | No Telegram CTA, connection promise, WhatsApp promotion, delivery timer or “fastest” claim. The app exposes available notification options; the FAQ honestly withholds a Telegram offer |
| Product/store parity | Public App Store description still advertises AI and WhatsApp/Pro. Parent owns independent product/release audit | Draft remains subject to product/release alignment. This website does not imply the app/backend was changed |
| Social proof | No verified testimonials, user counts, conversion results or comparative delivery benchmark | None fabricated or displayed |
| Visual | Optimized derivatives of existing `images/apartment-1.jpg` and logo, code-native notification illustration | No fake live inventory, match score or app screenshot. Explicit “example alert” and illustration caption |

The exact new price/billing contract and release/channel state were escalated early to the parent session while independent implementation continued.

## Overlapping PRs

- [#19](https://github.com/NestdAI/nestd-landing/pull/19) is **merged** and included in the base. Its download-funnel and attribution intent is retained; stale product claims and invalid store ID are corrected.
- [#20](https://github.com/NestdAI/nestd-landing/pull/20) remains open. The new About page incorporates its contact-form removal and preserves `#contact` plus `hello@nestd.nl`. Do not merge #20's old About markup over this redesign; it can be reconciled/superseded after review. This task does not close another contributor's PR.
- [#21](https://github.com/NestdAI/nestd-landing/pull/21) remains open and separate. Its partner-invite copy is not appropriate for the new marketing direction. Existing AASA, asset links and production verification rewrites remain byte-for-byte unchanged. No invite route or partner feature was enabled.

## Route and content audit

| Route | Result |
| --- | --- |
| `/`, `/en/` | Fully rendered localized hero, illustrative rental alert, value proposition, procedure, paid subscription, FAQs and download funnel |
| `/pricing.html`, `/en/pricing.html` | Paid-only offer, honest checkout-disclosed price/period, conditions, no free comparison table |
| `/about.html`, `/en/about.html` | Rental-search positioning, company/contact information, no contact form |
| `/download.html`, `/en/download.html` | Verified iPhone CTA, desktop QR handoff, clear paid requirement, honest Android status |
| `/privacy.html`, `/en/privacy.html` | New accessible shared shell. All original legal disclosures and original update date retained; a dated-policy notice makes their legacy status explicit |
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
- Content/attribution tests: **5 passed**, including preserved first/current-touch attribution, paid-only claims, legal parity, unchanged verification infrastructure and private listing fallback.
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
