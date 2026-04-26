# Nestd Landing PostHog Events

Goal: measure which channels and creative angles drive landing-page visits, store/app CTA intent, and deeplink attempts.

## Config

`script.js` reads the PostHog key from either:

```html
<meta name="posthog-key" content="[REDACTED]">
```

or:

```html
<script>window.NESTD_POSTHOG_KEY = '[REDACTED]'</script>
```

No PostHog key is committed to this repo.

## Implemented events

| Event | When | Key properties |
| --- | --- | --- |
| `page_view` | PostHog loads on regular landing pages | `path`, sanitized `url`, sanitized `referrer`, UTM fields, `language` |
| `theme_toggled` | Visitor toggles theme | `theme`, attribution props |
| `store_badge_clicked` | Visitor clicks App Store / Google Play CTA | `store`, `label`, `href`, attribution props |
| `navigation_clicked` | Visitor clicks nav/footer links | `label`, `href`, attribution props |
| configured section view events | Key sections enter viewport once per page load | event name from the section map in `script.js` |
| `app_deeplink_viewed` | `/app` deeplink page loads | attribution props |
| `app_deeplink_fallback_shown` | App did not open within timeout | attribution props |
| `app_deeplink_opened` | Page becomes hidden after deeplink attempt | attribution props |

## Privacy behavior

- The PostHog script only loads when a key is provided via deploy config.
- Automatic click autocapture and session recordings are disabled.
- Event payloads include allow-listed UTM parameters.
- `url` and `referrer` are stripped to origin + path before capture, so unknown query parameters are not sent.
- Events fired before the PostHog bundle loads are queued and flushed after initialization.

## UTM convention

Use:

```text
utm_source=tiktok|instagram|meta|student-community|seo
utm_medium=organic|paid|community|seo
utm_campaign=<audience>_<pain_or_angle>
utm_content=<creative_or_hook_id>
utm_term=<optional keyword/audience>
```

Example:

```text
https://nestd.nl/?utm_source=tiktok&utm_medium=organic&utm_campaign=student_housing_pain&utm_content=pov_087
```

## Guardrails

- Never mention source/data platform names publicly.
- No Reddit/LinkedIn for now.
- First week is approval-only for publishing.
- Paid spend cap: €20/day total across channels.
