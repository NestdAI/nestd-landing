# Alerts landing verification — 8 September 2026

Base: origin/main f09f8ea8e5e4bbdcbc3b1cb160b346d77b872734. Each variant has an isolated codex/ branch. No push or deployment has occurred.

## Automated checks

- `node --test tests/marketing-behavior.test.mjs`: 20/20 passing in each worktree.
- `node tests/static-landing-copy-smoke.mjs`: passing in each worktree.
- JavaScript syntax and `git diff --check`: passing.
- Behavior tests cover NL/EN precedence, native download intent without blocking links, first/current attribution, SDK enrichment sanitation, arbitrary/nested personal-data rejection, unsafe Meta URL/referrer contexts, section/navigation events, optional sticky behavior and deeplink lifecycle.
- Static checks cover verified download URL, translation pairs, assets/anchors/IDs, absence of forms, removed product features and invented proof.

## Browser evidence

In-app Chromium browser. Each requested width was confirmed by `innerWidth` after applying the viewport; an earlier multi-tab resize pass was discarded because the viewport override applies to the selected tab. Results below use one selected tab.

| Variant | Language | Viewport | CTA bottom | Horizontal overflow | Untranslated nodes |
| --- | --- | --- | --- | --- | --- |
| B | nl | 320 × 568 | 462px | None | 0 |
| B | en | 320 × 568 | 375px | None | 0 |
| B | nl | 390 × 844 | 452px | None | 0 |
| B | en | 390 × 844 | 409px | None | 0 |
| B | nl | 768 × 1024 | 605px | None | 0 |
| B | en | 768 × 1024 | 542px | None | 0 |
| B | nl | 1440 × 900 | 545px | None | 0 |
| B | en | 1440 × 900 | 545px | None | 0 |
| A | nl | 320 × 568 | 359px | None | 0 |
| A | en | 320 × 568 | 359px | None | 0 |
| A | nl | 390 × 844 | 383px | None | 0 |
| A | en | 390 × 844 | 355px | None | 0 |
| A | nl | 768 × 1024 | 454px | None | 0 |
| A | en | 768 × 1024 | 392px | None | 0 |
| A | nl | 1440 × 900 | 516px | None | 0 |
| A | en | 1440 × 900 | 516px | None | 0 |
| C | nl | 320 × 568 | 410px | None | 0 |
| C | en | 320 × 568 | 410px | None | 0 |
| C | nl | 390 × 844 | 415px | None | 0 |
| C | en | 390 × 844 | 415px | None | 0 |
| C | nl | 768 × 1024 | 597px | None | 0 |
| C | en | 768 × 1024 | 571px | None | 0 |
| C | nl | 1440 × 900 | 586px | None | 0 |
| C | en | 1440 × 900 | 586px | None | 0 |

- All hero actions fit above the fold in the 24 measured cases.
- Full-page desktop screenshots inspected for all three variants. Desktop and mobile review screenshots are saved in the task visualization directory.
- Native FAQ expansion checked. B/C sticky download appears after hero and hides near the final CTA, checked by scrolling to actual positions.
- About/pricing/privacy checked at 390px in both languages: no overflow, zero untranslated data nodes, titles update, no observed console errors.
- A real hero link click opened https://apps.apple.com/nl/app/nestd/id6761392857 and the Apple page identified Nestd by Muba B.V., free with in-app purchases, iPhone only. No installation or purchase was performed.
- Focus styles, native semantics, zoom-permitting viewport tags and prefers-reduced-motion CSS reviewed. No native OS reduced-motion emulation or 200% browser text-zoom run was performed; responsive reflow was measured directly at 320/390/768/1440 widths. Physical Safari/iPhone validation is not claimed.

## Independent review

The reviewer found Dutch #hoe-het-werkt/#vragen hashes were missing from analytics allowlists, suppressing Meta after normal navigation and recording home instead of the section. Both aliases and a regression test were added. No remaining substantive homepage findings in the read-only review.

## External follow-up

The App Store description still mentions an AI assistant and enhanced AI support. The new landing uses the user-approved alerts-only positioning. App Store metadata and the Expo app were not changed by this landing task. Conversion uplift and notification speed have not been measured, and no such results are claimed.

## Local review

- Comparison: http://127.0.0.1:4400
- A: http://127.0.0.1:4401/?lang=nl
- B: http://127.0.0.1:4402/?lang=nl
- C: http://127.0.0.1:4403/?lang=nl

Push and Vercel Preview deployment await the user-requested visual review.
