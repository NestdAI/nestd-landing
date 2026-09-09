# Premium app presentation — 9 September 2026

## Implemented on PR23, not rejected PR22

- Existing Nestd page structure, full About, NL/EN, persistent System/Light/Dark and confirmed first-week-free / €19.99-month offer retained.
- CSS perspective iPhone frames, titanium edges, depth/shadows, actual source-selection screen, separate illustrated lock-screen notification. No WebGL/runtime dependency.
- Short entrance choreography, hover depth, card/step microinteractions, existing scroll reveals. Motion control and reduced-motion fallback. No endlessly looping decoration.
- Concrete NL/EN headline support: preferences → matching rental → provider response. Refined offer card and rounded download CTA.
- Actual screenshot: `assets/app-source-selection.png`, copied unedited from `pr175-product-pivot/test-artifacts/pr-175-product-pivot-2026-09-06/sources-onboarding-after.png`. This is a simulator capture of the upcoming PR175 app, not proof that that version is released. Visible caption explicitly identifies app preview; on English site alt identifies Dutch UI.
- Dashboard capture excluded (test name + historical inventory); settings excluded (obsolete product copy + error toast). No user information published.

## Evidence not supplied — not published

Requested customer quotes, active users and competitive notification timings remain outstanding.

- Fresh Apple NL lookup id6761392857: userRatingCount=0. NL recent-review RSS also 0 entries. This is not a worldwide assertion of no reviews.
- No permission-backed review text was provided. Existing experience/App Store links retained; no fabricated quotes, stars, faces or logos as endorsements.
- Protected secret metadata store is empty. No authenticated current analytics/database aggregate available in this task. Historical listing counts are NOT user counts.
- No same-source/time-window competitor delivery dataset available. Competitor advertising timings and DB `notified_at` do not establish device delivery or superiority.

## Required publication evidence

1. Users: define metric (e.g. unique non-test users active in last 30 days), UTC as-of date, exclusions, read-only aggregation source; publish aggregate only.
2. Reviews: exact quote, chosen attribution, source/permalink, permission where supplied privately, date. Do not alter meaning or imply an aggregate rating from selected quotes.
3. Comparative timing: same provider/listing/sample window/search criteria/channel; timestamp source publication/first observation separately from actual device receipt. Report sample size, period, median/p95 and non-deliveries for Nestd/Stekkies/RentSlam/Rentbird. Record missing timestamps as missing, not zero. No benchmark shown until comparable measurement exists.

These gates belong to this review document, not as operational placeholders in marketing copy. App/store release and trial configuration remain separate from this landing change.

## Verification

- Build and 3 existing static/attribution checks passed.
- Full browser suite: 64 viewport/theme checks,16 axe page/theme scans,8 no-JS routes plus links, keyboard, theme persistence, attribution and reduced-motion checks passed.
- Additional browser verification: pause/play state cancels device animations; reduced motion hides motion control. Final NL/EN desktop/mobile dark/light captures in `docs/premium-screenshots/`.
- Narrow screen test exposed an overhanging transformed device at320px; reduced offsets corrected it, full suite rerun passed.
- No production deployment, no app/backend changes, no real notification or review submission.
