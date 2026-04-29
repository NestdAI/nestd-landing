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

No PostHog key is committed to this repo.

Meta Pixel is initialized centrally in `script.js` with Pixel ID `1435983921187208`. It can be overridden per deployment with:

```html
<meta name="facebook-pixel-id" content="<pixel-id>">
```

or:

```html
<script>window.NESTD_META_PIXEL_ID = '<pixel-id>'</script>
```

A `<noscript>` PageView fallback is present on the public HTML pages for visitors without JavaScript.

### App

The Expo app uses `posthog-react-native` from `app/lib/posthog.ts` with host:

```text
https://eu.i.posthog.com
```

Native app events are PostHog-only for now. Do **not** install Meta Pixel in the native app; Meta app attribution later needs Meta SDK / MMP / Conversions API, not the website pixel.

## Website funnel events

Website pages are marketing/content pages. They currently drive visitors to the app download CTAs. There is no website WhatsApp/contact conversion and no website signup/subscription flow.

| Funnel step | PostHog event | Meta event | When | Key properties | Notes |
| --- | --- | --- | --- | --- | --- |
| Page visit | `page_view` | `PageView` | Landing/public page loads | PostHog: `path`, sanitized `url`, sanitized `referrer`, UTM fields, `language` | Meta `PageView` fires regardless of PostHog key. |
| Section/content view | `whatsapp_alerts_section_viewed`, `ai_matching_section_viewed`, `duo_search_section_viewed`, `how_it_works_section_viewed`, `pricing_section_viewed` | `ViewContent` | Key sections enter viewport once per page load | PostHog attribution props; Meta: `content_name`, `content_category=landing_section` | This is the website `ViewContent` mapping. |
| App CTA click | `store_badge_clicked` | `ViewContent` | App Store / Google Play badge clicked | PostHog: `store`, `label`, sanitized `href`, `placement`; Meta: `content_name=app_download_cta`, `content_category=app_download`, `placement`, `store` | Not `Lead`, because no form/signup is completed on the website. |
| Navigation click | `navigation_clicked` | — | Nav/footer link clicked | `label`, `href`, `location` | PostHog-only. |
| Theme change | `theme_toggled` | — | Visitor toggles theme | `theme` | PostHog-only utility event. |
| Deeplink page view | `app_deeplink_viewed` | `PageView` | `/app` deeplink page loads | attribution props | Public website/deeplink page, not native app event. |
| Deeplink fallback | `app_deeplink_fallback_shown` | — | App did not open within timeout | attribution props | PostHog-only. |
| Deeplink opened signal | `app_deeplink_opened` | — | Page becomes hidden after deeplink attempt | attribution props | Best-effort signal only. |

### Website events explicitly not used

| Meta event | Status | Why |
| --- | --- | --- |
| `Contact` | Not used | There is no WhatsApp/contact click conversion on the website. |
| `Lead` | Not used on current website | No waitlist/signup form is completed on the website. Use only if a real lead form returns success. |
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
| Purchase completed | `purchase_completed` or `subscription_started` | Later: `Purchase`/`Subscribe` through app attribution | RevenueCat purchase success | Capture plan/product category, not raw receipt. |
| Restore completed | `restore_completed` | — | RevenueCat restore success | Boolean active entitlement only. |
| Listing viewed | `listing_viewed` | — | Listing detail opened | Avoid raw listing IDs in analytics. |
| Listing saved/reacted | `listing_saved` / `listing_reacted` | — | User saves/likes/rejects | Use action/type, no source-platform names. |
| Chat message sent | `chat_message_sent` | — | User sends message | Do not capture message text. |

## Privacy behavior

- PostHog script only loads when a key is provided via deploy config.
- Meta Pixel loads from the public pixel ID and tracks only standard website events listed above.
- Automatic PostHog click autocapture and session recordings are disabled.
- Event payloads include allow-listed UTM parameters in PostHog only.
- `url` and `referrer` are stripped to origin + path before PostHog capture.
- Meta event parameters are allow-listed and do not include email, phone, raw URLs, raw referrers, full preferences, listing IDs, or message content.
- Events fired before the PostHog bundle loads are queued and flushed after initialization.

## UTM convention

Use:

```text
utm_source=meta|instagram|tiktok|student-community|seo
utm_medium=paid|organic|community|seo
utm_campaign=<audience>_<pain_or_angle>
utm_content=<creative_or_hook_id>
utm_term=<optional keyword/audience>
```

Example:

```text
https://nestd.nl/?utm_source=meta&utm_medium=paid&utm_campaign=starters_housing_pain&utm_content=pov_087
```

## Guardrails

- Special Ad Category: Housing for Meta campaigns. Do not work around it.
- Do not launch/scale Meta campaigns until Meta Pixel PageView/ViewContent and PostHog events are verified in production.
- Never mention source/data platform names publicly.
- No Reddit/LinkedIn for now.
- First week is approval-only for publishing.
- Paid spend cap: €20/day total across channels unless Hicham says otherwise.
