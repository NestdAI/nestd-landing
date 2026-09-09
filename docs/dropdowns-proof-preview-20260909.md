# Dropdown motion and proof design fixtures

FAQ disclosures animate open AND closed (300ms), preserve native keyboard/no-JS semantics, and settle instantly under reduced motion. Rapid reversal and resize cancel safely.

## Editable examples
Edit `scripts/preview-proof.mjs` for example user count, timings and bilingual quotes. These are intentionally FICTIONAL with labels on every card. Platform A/B are not measured real competitors. No Review/AggregateRating schema added.

Local and Vercel preview builds show the section. `VERCEL_ENV=production` or `NESTD_HIDE_PROOF_PREVIEW=1` omits it entirely. Do not remove labels or promote it to genuine proof without independently verified figures, consistent measurement windows and publication permission for quotes. Real-data publication is separate work.

## Verification
Build/static tests passed. Browser suite: 64 viewport/theme checks, 16 axe scans, 8 no-JS routes; FAQ opening/closing animation, keyboard, rapid reversal, reduced motion and placeholder labels checked. Production build separately verified to exclude proof blocks in both NL/EN, then default preview output regenerated.

Hibaroo change is separate PR259: measure mobile home search/filter header bottom plus12px; follows resize and scroll, no search overlap, desktop unchanged. Three banner browsers passed at320/390/desktop, lint and TypeScript passed.

No merge/production deployment or real booking/notification.
