# Nestd Tracking Events — Website vs App

Goal: keep PostHog as the source of truth for funnel/product analysis, and use Meta Pixel only for paid Meta ads optimization and retargeting.

## Config

### Website / landing

`script.js` reads the PostHog key from either:

```html
<meta name="posthog-key" content="[REDACTED]">
```

or:

```html
<script>window.NESTD_POSTHOG_KEY = '[REDACTED]'</script>
```

The PostHog project API key is configured as a client-side public project key. Never commit the PostHog personal API key.

Meta Pixel is initialized centrally in `script.js` with Pixel ID `1435983921187208`. It only loads in safe public marketing/deeplink contexts (`/`, `/about.html`, `/pricing.html`, `/privacy.html`, `/app`) and is intentionally disabled on listing/product routes such as `/listing/*`, when unknown query parameters are present, or when the same-origin referrer is a listing route, because the browser can implicitly expose URL/referrer context to Meta even when event properties are sanitized. It can be overridden per deployment with:

```html
<meta name="facebook-pixel-id" content="<pixel-id>">
```

or:

```html
<script>window.NESTD_META_PIXEL_ID = '<pixel-id>'</script>
```

A `<noscript>` PageView fallback is present only on public marketing/deeplink HTML pages for visitors without JavaScript. It is intentionally omitted from `/listing/*`.

### App

The Expo app uses `posthog-react-native` from `app/lib/posthog.ts` with host:

```text
https://eu.i.posthog.com
```

Native app events are PostHog-only for now. Do **not** install Meta Pixel in the native app; Meta app attribution later needs Meta SDK / MMP / Conversions API, not the website pixel.

## Website funnel events

Website pages are marketing/content pages. They drive visitors to the app download CTAs and the waitlist/early-access form. There is no website WhatsApp/contact conversion and no website subscription flow.

| Funnel step | PostHog event | Meta event | When | Key properties | Notes |
| --- | --- | --- | --- | --- | --- |
| Page visit | `page_view` | `PageView` | Landing/public page loads | PostHog: `path`, sanitized `url`, UTM/click IDs, first/current-touch attribution, `language` | Meta `PageView` fires regardless of PostHog key. |
| Section/content view | `whatsapp_alerts_section_viewed`, `ai_matching_section_viewed`, `duo_search_section_viewed`, `how_it_works_section_viewed`, `pricing_section_viewed`, `waitlist_section_viewed` | `ViewContent` | Key sections enter viewport once per page load | PostHog attribution props; Meta: `content_name`, `content_category=landing_section` | This is the website `ViewContent` mapping. |
| App CTA click | `store_badge_clicked` | `ViewContent` | App Store / Google Play badge clicked | PostHog: `store`, `label`, sanitized `href`, `placement`, attribution props; Meta: `content_name=app_download_cta`, `content_category=app_download`, `placement`, `store` | Not `Lead`; only successful waitlist signup is a lead. |
| Waitlist signup started | `waitlist_signup_started` | — | Visitor submits the waitlist form | `placement`, attribution props | Do not send the submitted email to analytics. |
| Waitlist signup completed | `waitlist_signup_completed` | `Lead` | Waitlist API returns success | PostHog: `placement`, attribution props; Meta: `content_name=waitlist_signup`, `content_category=website_lead`, `placement` | Fire only after backend success. No email/name/phone. |
| Waitlist duplicate | `waitlist_signup_duplicate` | — | Waitlist API returns duplicate/already exists, including 409 or duplicate/already_exists response body | `placement`, attribution props | Not a new Meta `Lead`, to avoid double-counting. |
| Waitlist signup failed | `waitlist_signup_failed` | — | Waitlist API fails | stable `reason`, `placement`, attribution props | Reason code only: `invalid_email`, `duplicate`, `network_error`, `server_error`, `unknown_error`. No raw error messages. |
| Navigation click | `navigation_clicked` | — | Nav/footer link clicked | `label`, `href`, `location` | PostHog-only. |
| Theme change | `theme_toggled` | — | Visitor toggles theme | `theme` | PostHog-only utility event. |
| Deeplink page view | `app_deeplink_viewed` | `PageView` | `/app` deeplink page loads | attribution props | Public website/deeplink page, not native app event. |
| Listing deeplink page view | — | — | `/listing/*` deeplink page loads | — | No Meta/PostHog event: avoid leaking raw listing identifiers via browser URL/referrer context. |
| Deeplink fallback | `app_deeplink_fallback_shown` | — | App did not open within timeout | attribution props | PostHog-only. |
| Deeplink opened signal | `app_deeplink_opened` | — | Page becomes hidden after deeplink attempt | attribution props | Best-effort signal only. |

### Website events explicitly not used

| Meta event | Status | Why |
| --- | --- | --- |
| `Contact` | Not used | There is no WhatsApp/contact click conversion on the website. |
| `Lead` | Used for successful waitlist signup only | Fire only after the waitlist backend returns success. Never include email, name, phone, raw URL, referrer, or preferences. |
| `Subscribe` / `Purchase` | Not used on website | Subscription/purchase happens in the app via stores/RevenueCat. |

## App funnel events

The app is the product funnel. PostHog is already installed in the native app.

| Funnel step | Existing PostHog event | Meta event | When | Key properties | Status |
| --- | --- | --- | --- | --- | --- |
| App opened | `app_opened` | — | App starts | `source=app`, `platform` | Implemented. |
| Screen viewed | `screen_viewed` | — | Route changes | normalized `screen`, `platform` | Implemented. |
| Signup started | `signup_started` | Later: `CompleteRegistration` only if Meta app attribution is added | Email/OAuth signup starts | `method`, `source=app` | Implemented in app. |
| Signup failed | `signup_failed` | — | Signup error | `method`, `source=app`, stable `reason` | Implemented; keep raw errors out. |
| Signup completed | `signup_completed` | Later: `CompleteRegistration` only if Meta app attribution is added | Account created | `method`, `source=app`, `locale` | Implemented in app. |
| Onboarding step completed | `onboarding_step_completed` | — | User advances onboarding step | `step`, `source=app` | Implemented. |
| Onboarding completed | `onboarding_completed` | Later: `Lead`/`CompleteRegistration` only via app attribution | Preferences saved and onboarding marked complete | `city_count`, budget bucket, type count, area bucket, rooms | Implemented; preference values are bucketed/counts. |

### Recommended app additions

| Funnel step | PostHog event to add | Meta event later | When | Notes |
| --- | --- | --- | --- | --- |
| Paywall viewed | `paywall_viewed` | — | `/paywall` shown | Add placement/source if known. |
| Paywall dismissed | `paywall_dismissed` | — | Paywall closed without purchase | No raw RevenueCat payload. |
| Subscription started | `subscription_started` | Later: `Subscribe` through app attribution | User starts Pro subscription flow / entitlement begins | Capture plan/product category and subscription tier only. |
| Purchase completed | `purchase_completed` | Later: `Purchase` through app attribution | RevenueCat purchase success | Capture plan/product category, not raw payloads/receipts. |
| Purchase failed | `purchase_failed` | — | RevenueCat purchase fails or is cancelled | Stable `reason` code only; no raw error messages. |
| Restore completed | `restore_completed` | — | RevenueCat restore success | Boolean active entitlement only. |
| Listing viewed | `listing_viewed` | — | Listing detail opened | Avoid raw listing IDs; use coarse listing/source category only if approved. |
| Listing saved | `listing_saved` | — | User saves listing | No raw listing IDs, addresses, or source-platform names. |
| Listing reacted | `listing_reacted` | — | User likes/rejects/reacts | Use action/type only; no source-platform names. |
| Application started | `application_started` | — | User starts applying/responding to listing | No raw listing IDs, addresses, or source-platform names. |
| Chat opened | `chat_opened` | — | User opens AI chat | Context only: source/screen/subscription tier. |
| Chat message sent | `chat_message_sent` | — | User sends message | Do not capture message text. |
| Chat limit reached | `chat_limit_reached` | — | Free user hits chat limit | Context only: source/screen/subscription tier. |
| Paywall triggered from chat | `paywall_triggered_from_chat` | — | Chat limit/paywall placement shown from chat | Context only; no message text. |
| Profile preferences updated | `profile_preferences_updated` | — | User updates profile/preferences | Bucket budget/surface; city count only unless approved. |
| Search preferences saved | `search_preferences_saved` | — | User saves search preferences | Bucket budget/surface; city count only; no full preference dumps. |
| Platform connect started | `platform_connect_started` | — | User starts integration/connect flow | Avoid public/source platform names if against guardrails. |
| Platform connect completed | `platform_connect_completed` | — | Connect flow succeeds | No tokens/secrets. |
| Platform connect failed | `platform_connect_failed` | — | Connect flow fails | Stable `reason` code only; no raw errors/tokens. |

## Privacy behavior

- PostHog script only loads when a key is provided via deploy config.
- Meta Pixel loads from the public pixel ID only in safe public marketing/deeplink contexts and tracks only standard website events listed above.
- Automatic PostHog click autocapture and session recordings are disabled.
- Event payloads include allow-listed UTM parameters/click IDs in PostHog only: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`.
- First-touch attribution is stored in `localStorage`; current-touch attribution is stored in `sessionStorage` and survives same-session navigation/language changes. Payloads include top-level current attribution plus `first_touch_*` and `current_touch_*` fields for UTM/click IDs, `landing_page`, `referrer`, and `captured_at`.
- Waitlist API submissions include the same sanitized attribution fields plus `source=landing`; the submitted email is sent only to the backend and is stripped from analytics payloads.
- `url`, `landing_page`, and `referrer` are stripped to origin + path before PostHog capture or waitlist submission; listing/product deeplink routes, unknown query strings, and listing referrers are not sent to Meta.
- Meta event parameters are allow-listed and do not include email, phone, raw URLs, raw referrers, full preferences, listing IDs, or message content; Meta is not initialized on `/listing/*` or after same-origin listing referrers.
- Events fired before the PostHog bundle loads are queued and flushed after initialization.

## UTM convention

Use:

```text
utm_source=meta|instagram|tiktok|student-community|seo
utm_medium=paid|paid_social|organic|community|seo
utm_campaign=<audience>_<pain_or_angle>
utm_content=<creative_or_hook_id>
utm_term=<optional keyword/audience>
```

Example:

```text
https://nestd.nl/?utm_source=meta&utm_medium=paid_social&utm_campaign=meta_nl_traffic_waitlist_v1&utm_content=ugc_olivia_endcard_v1&utm_term=broad_nl_1834
```

## Guardrails

- Special Ad Category: Housing for Meta campaigns. Do not work around it.
- Do not launch/scale Meta campaigns until Meta Pixel PageView/ViewContent and PostHog events are verified in production.
- Never mention source/data platform names publicly.
- No Reddit/LinkedIn for now.
- First week is approval-only for publishing.
- Paid spend cap: €20/day total across channels unless Hicham says otherwise.
