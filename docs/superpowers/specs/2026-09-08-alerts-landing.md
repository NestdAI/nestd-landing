# Nestd alerts landing: approved design

User approved implementation of all three directions with “doe maar” on 2026-09-08. This document incorporates the later corrections to the original brief: the app is live; the goal is direct App Store traffic; all AI features, chatbot, swipe discovery and AI explanations/matching are removed from the product story. The initial waitlist requirement is superseded.

## Scope and acceptance

- Build three complete, structurally distinct pages in separate `codex/` branches/worktrees, each starting at current `origin/main` f09f8ea8e5e4bbdcbc3b1cb160b346d77b872734.
- A (`codex/landing-alerts-direct`): a typography-led, centered hero, “Snel weten wat er te huur komt.”, concise explanation and one prominent download action; plain steps, a small example alert, filters, FAQ and final download. White, dark ink, restrained Nestd red, DM Sans. No hero illustration.
- B (`codex/landing-alerts-notification`): compact left-aligned hero, “Nieuwe huurwoning? Je krijgt een melding.”, clear download action, one substantial example notification as the page's main explanation. Follow the sequence filters → alert → open listing/respond. White and light grey, dark ink, Nestd red, IBM Plex Sans. No dashboard/card collection.
- C (`codex/landing-alerts-human`): editorial, ordinary lived-in rental photograph beside “Minder refreshen. Meer tijd voor je leven.” with concrete explanation and download; human situations interleaved with product steps, FAQ and final action. White, quiet serif headings, sans-serif body. On mobile, promise and CTA precede photograph. Images are atmosphere/illustration, not customers, testimonials or actual available homes.
- Product story: monitor new listings, deterministic city/budget/rooms/floor-area filters, fast alerts, user responds directly to advertiser. No AI/chat/swipe/partner promises. No fabricated reviews, user counts, coverage, timing statistics, “fastest” comparisons or availability. No automatic replies/applications. No new Free/Pro entitlement allocation or price claims.
- All primary CTAs open `https://apps.apple.com/nl/app/nestd/id6761392857` directly. The old ID 6740091498 is incorrect. Native anchors must work even if JS/analytics fails. Downloading is free; no Google Play CTA.
- Entire marketing experience supports Dutch and English: visible copy, metadata, alt/ARIA, FAQs and buttons. Preserve query `lang` → `/en/` → stored language → Dutch precedence and URL campaign/hash preservation.
- Minimal navigation: how it works, questions, language. Real contact `hello@nestd.nl`, about and privacy in footer. No dead legal links. Update public about/pricing/deeplink copy that would contradict the approved product direction. Do not remove services/features from the separate Expo app repository.
- Preserve first/current-touch campaign attribution, its existing storage keys and PostHog/Meta event semantics. `cta_clicked` identifies App Store intent, not an install. No email/search-preference values or sensitive URLs/SDK-derived properties in analytics.
- Support desktop 1440×900 and 1366×768; mobile 390×844, 360×800, 320×568; usable at 200% zoom. No horizontal overflow or content hidden to mask overflow. Visible focus, semantic links/buttons, correctly named controls, reduced-motion.
- No push/deploy/PR before user visual approval of the implemented local pages/screenshots. Leave the worktrees for that review. Main checkout and rejected branches stay untouched.

## Boundaries and file interface

Each homepage owns `index.html` and `landing.css`. Shared `landing.js` handles bilingual attributes and optional menu/sticky controls; shared `script.js` owns marketing analytics only. The homepage does not load the old `styles.css`, `pages.css`, or `i18n.js`, and has no inline interaction code.

Use `data-nl` and `data-en` on text-only elements; `data-alt-nl/en`, `data-aria-nl/en` for attributes. Page title and meta description are supplied using their own `data-nl/en` attributes. Put both scripts at the end of body in order: `landing.js`, `script.js`. Use `id="lang-toggle"`, optional `id="menu-toggle"` with `aria-controls="mobile-menu"`, `id="mobile-menu" hidden`. Every App Store action has `data-cta-placement="hero|nav|mid_page|bottom|mobile_sticky"`. Use `data-section="how_it_works|alerts|filters|faq|download"` on semantic sections. Optional sticky anchor is `[data-sticky-cta]`, hidden by default until the hero CTA has passed above the viewport and hidden near the final CTA. No second dominant CTA in the hero.

Static HTML is complete in Dutch without JS. Translations do not use innerHTML for dynamic/untrusted strings. Analytics never derives user-controlled free text from page content. Illustration is explicitly labelled as example content.
