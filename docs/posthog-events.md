# Nestd website analytics

The live website sends visitors directly to the Nestd iPhone app. A click indicates App Store intent, not an installation, account, lead or subscription. The website does not collect email addresses or search preferences. This contract covers the website only; it does not change the native app's instrumentation.

## Configuration

`script.js` reads the public PostHog project key from `window.NESTD_POSTHOG_KEY` or `<meta name="posthog-key">`. Events go to `https://eu.i.posthog.com`. Personal API keys never belong in client code.

Meta uses public pixel ID `1435983921187208`, overridable through `window.NESTD_META_PIXEL_ID` or `<meta name="facebook-pixel-id">`. An explicit empty window configuration disables that integration. Automatic Meta configuration is disabled before initialization. There is no unconditional `<noscript>` tracking pixel because it would bypass the URL/referrer privacy checks.

Both providers are limited to the homepage, `/en/`, about, pricing, privacy, and the public `/app` fallback. Product/listing/verification paths do not initialize either SDK or send events. Blocked storage, unavailable SDKs, or failed analytics never prevent a download link from working.

## Events

| Visitor action | PostHog | Meta | Allowed event-specific fields |
| --- | --- | --- | --- |
| Public page loads | `page_view` | `PageView` | Attribution and language |
| App Store anchor clicked | `cta_clicked` | `ViewContent` | `content_name=app_store_cta`, `content_category=app_download`, fixed App Store `href`, enumerated `placement` |
| How it works enters view | `how_it_works_section_viewed` | `ViewContent` | Meta `content_name=how_it_works`, `content_category=landing_section` |
| Alerts enters view | `whatsapp_alerts_section_viewed` | `ViewContent` | Meta `content_name=alerts`, `content_category=landing_section` |
| Filters enters view | `filters_section_viewed` | `ViewContent` | Meta `content_name=filters`, `content_category=landing_section` |
| FAQ enters view | `faq_section_viewed` | `ViewContent` | Meta `content_name=faq`, `content_category=landing_section` |
| Final download enters view | `download_section_viewed` | `ViewContent` | Meta `content_name=download`, `content_category=landing_section` |
| Known navigation link clicked | `navigation_clicked` | — | Enumerated `destination` and `location` |
| Legacy legal-page theme changed | `theme_toggled` | — | `theme=light|dark` |
| Public app fallback loads | `app_deeplink_viewed` | — | Attribution and language |
| App fallback timeout | `app_deeplink_fallback_shown` | — | Attribution and language |
| Page hides after an app-opening attempt | `app_deeplink_opened` | — | Attribution and language; best-effort signal only |

The historic `whatsapp_alerts_section_viewed` name is retained for continuity and denotes the alerts section. Each section is counted once per page load. An App Store click is counted once and does not also count as navigation. The native anchor destination is `https://apps.apple.com/nl/app/nestd/id6761392857`.

`placement` is one of `hero`, `nav`, `mid_page`, `bottom`, `mobile_sticky`. Navigation uses stable `home`, `how_it_works`, `faq`, `about`, `pricing`, `privacy`, `contact` destinations and `nav`, `mobile_nav`, `footer` locations. No visible label, email address, arbitrary href or form contents are read into analytics. `Lead`, `Purchase`, `Subscribe`, unknown custom events and pre-launch form events are not sent by this website.

## Attribution and language

Existing storage keys and first/current-touch semantics are preserved:

- First touch: `localStorage.nestd_attribution_first_touch_v1`; the first visit survives subsequent campaigns.
- Current touch: `sessionStorage.nestd_attribution_current_touch_v1`; a valid explicit campaign refreshes it, while untagged navigation and language switching retain it.
- Supported identifiers: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`.
- Payloads contain top-level current attribution, compatibility fields `first_touch_*` and `current_touch_*`, and sanitized nested `first_touch` and `current_touch` objects.
- Context fields are `landing_page`, `referrer`, `captured_at`; campaign values must be identifier strings of at most 200 ASCII letters, digits, dots, hyphens or underscores. Use campaign IDs, never people, email addresses, search preferences or JSON. Invalid values are omitted, including when restored from older storage.
- Landing URLs retain a known public pathname only. Query strings and hashes are removed. External referrers and unknown/product paths are reduced to their origin, so arbitrary external path segments are never captured.
- Storage access and malformed JSON are guarded; an in-memory snapshot supports browsers that block storage.

Language priority is valid `?lang=nl|en`, then the `/en/` path, then valid `nestd-lang`, then Dutch. `landing.js` updates visible text, metadata, alt text and accessible names. Switching retains the current campaign query and fragment. Same-origin links retain the selected language; App Store anchors are unchanged. A queued click retains its event-time language.

Example campaign URL:

```text
https://www.nestd.nl/?lang=en&utm_source=meta&utm_medium=paid_social&utm_campaign=rental_alerts_v1&utm_content=creative_01
```

## Privacy at the transport boundary

The public `nestdAnalytics.track` API accepts only named events and enumerated properties. It cannot forward arbitrary strings or nested objects. Attribution is assembled internally rather than accepted from callers.

PostHog autocapture, automatic page views/leaves, session recordings, exception/performance capture, surveys, feature flags and person profiles are disabled. The `before_send` hook rebuilds each event's properties **after SDK enrichment**: it removes automatic current/initial URL and referrer fields, super-properties, `$set`/`$set_once`, arbitrary nested properties, and any identified user data. It retains validated anonymous SDK IDs, the public project token, the safe event contract and sanitized attribution. Anonymous identity and session analysis remain possible without copying browser URLs or form values. Critical clicks use `sendBeacon` with immediate sending; delivery still depends on the browser/network, and navigation is never delayed.

Meta has no equivalent local payload hook for all browser-derived context. It is therefore suppressed when the current URL or referrer contains an unknown query parameter, an invalid campaign value, a non-public same-origin path, an arbitrary external referrer path, a sensitive fragment or an email-shaped value. Only known section fragments are allowed. This deliberately trades some Meta coverage for privacy. Meta receives only `PageView`/`ViewContent` and enumerated content names/categories/placements; PostHog remains the attribution source of truth.

Implementation references: [PostHog JavaScript configuration](https://posthog.com/docs/libraries/js/config), [event redaction and immediate navigation events](https://posthog.com/docs/libraries/js/usage).

## Verification

No test initializes a live network SDK or sends a real analytics request. Node VM tests execute the production scripts with storage failures, multiple campaign visits, native link clicks and a transport-boundary SDK enrichment fixture containing hostile URL, person-property and nested-preference fields.

```bash
node --test tests/marketing-behavior.test.mjs
node tests/i18n-language-url-smoke.mjs
node tests/marketing-attribution-smoke.mjs
```

The former `waitlist-attribution-smoke.mjs` is replaced by the marketing attribution entry point above. Visual browser QA additionally checks language, menu, native CTA destinations and responsive behavior.
