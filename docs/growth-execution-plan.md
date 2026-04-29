# Nestd Week 0–2 Growth Execution Plan

> Working plan for pre-launch Nestd marketing. App stores are not live yet, so the primary goal is measurable pre-launch demand: signups/waitlist, CTA clicks, WhatsApp opt-ins, and return visits.

## Current context

- Website: `nestd.nl`
- App Store / Google Play: not live yet
- Main analytics source: PostHog
- PostHog host: `https://eu.i.posthog.com`
- Paid budget cap: €20/day total across all channels
- Week 1 publishing: approval-only
- Comments/replies: allowed
- Channels: TikTok, Instagram, Meta if possible, student communities, SEO
- Excluded for now: Reddit, LinkedIn
- Guardrail: never mention source/data platform names publicly
- Tone:
  - Students: edgy/comedy
  - Expats: practical/helpful
  - Young professionals: frustrated but functional
- TikTok: verification pending
- Meta: personal account access blocked/tricky; use clean Business Manager via team member, agency/partner, or appeal only. No shady workarounds.

## Funnel v0

```text
Ad/Post → Landing page → CTA click → Signup/waitlist → WhatsApp opt-in
```

Later, once stores are live:

```text
Ad/Post → Store page → Download → Signup → Activation
```

## Current KPI priority

1. Signups / waitlist joins
2. WhatsApp opt-ins, if available
3. CTA clicks
4. Pricing page views
5. Return visits
6. Later: app downloads once stores are live

## Tracking state

### Landing

PostHog tracking is already implemented in the landing repo:

- File: `script.js`
- Docs: `docs/posthog-events.md`
- Host: `https://eu.i.posthog.com`
- Privacy defaults:
  - `autocapture: false`
  - `disable_session_recording: true`
  - URL/referrer sanitized
  - UTM fields allow-listed
  - no key committed to repo

### App

PostHog tracking is documented/implemented in the app repo:

- Docs: `app/docs/posthog-events.md`
- Package: `posthog-react-native`
- Env variables:
  - `EXPO_PUBLIC_POSTHOG_API_KEY`
  - `EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`

## Event schema v0

Landing / pre-launch events:

- `page_view`
- `landing_viewed`
- `pricing_viewed`
- `cta_clicked`
- `waitlist_joined`
- `whatsapp_clicked`
- `language_switched`
- `pro_interest_clicked`
- `duo_search_interest_clicked`
- `ai_agent_interest_clicked`

App events:

- `app_opened`
- `screen_viewed`
- `signup_started`
- `signup_completed`
- `signup_failed`
- `onboarding_step_completed`
- `onboarding_completed`

Recommended properties:

```json
{
  "utm_source": "tiktok",
  "utm_medium": "organic",
  "utm_campaign": "student_housing_pain",
  "utm_content": "pov_87_replies",
  "audience": "students",
  "angle": "housing_pain",
  "page": "/",
  "language": "nl"
}
```

## UTM convention

Every public link gets UTMs:

```text
utm_source=tiktok|instagram|meta|student-community|seo
utm_medium=organic|paid|community|seo
utm_campaign=<audience>_<pain_or_angle>
utm_content=<creative_or_hook_id>
utm_term=<optional_keyword_or_audience>
```

Example:

```text
https://nestd.nl/?utm_source=tiktok&utm_medium=organic&utm_campaign=student_housing_pain&utm_content=pov_number_87
```

## Content sets

### Set 1 — Student housing pain / comedy

Channels: TikTok, Reels, Meta
Tone: edgy, meme-ish, painful comedy

Angles:
- late replies
- hospiteren
- 100+ reactions on one studio
- budget vs reality
- AI searches while you live

Example hooks:
- “POV: je reageert binnen 4 minuten en bent alsnog nummer 126.”
- “Nederlandse huurmarkt speedrun: open app, zie woning, woning weg.”
- “Als hospiteren een fulltime baan was, had je tenminste inkomen.”

### Set 2 — Expat survival

Channels: Instagram, Meta, SEO
Tone: practical, calmer, helpful

Example hooks:
- “New in the Netherlands? Rental listings disappear faster than you can translate them.”
- “Stop refreshing rental sites. Let AI watch the market for you.”

### Set 3 — WhatsApp alerts

Goal: conversion / signup intent

Example hooks:
- “Nieuwe huurwoning? Gewoon direct op WhatsApp.”
- “Laat AI zoeken. Jij krijgt alleen de matches.”

### Set 4 — Duo Zoeken

Audience: couples, friends, housemates

Example hooks:
- “Jij wil lichtinval. Zij wil betaalbaar. Nestd zoekt de match.”
- “Stop met elkaar 37 woninglinks sturen. Swipe apart, match samen.”

## AI creative stack

Possible tooling: Higgsfield or equivalent AI creative tooling.

Needed assets:
- Nestd logo
- brand colors
- app screenshots/mockups
- desired formats:
  - 9:16 video
  - 1:1 post
  - 4:5 Instagram
- example style references

If app screenshots are missing, use fake-but-honest temporary assets:
- product mockups
- chat/WhatsApp-style visuals
- housing chaos memes
- AI assistant concept visuals

Guardrail: do not imply Nestd has access/features/data it does not actually have.

## Week 0 — Setup

Goal: make growth measurable before spending money.

Tasks:
1. Verify PostHog key is configured in deployed `nestd.nl`.
2. Verify landing events are arriving in PostHog.
3. Verify UTM capture works end-to-end.
4. Create PostHog dashboard:
   - visits by channel
   - CTA clicks by channel
   - waitlist/signups
   - WhatsApp clicks
   - best `utm_content`
   - landing → CTA → signup conversion
5. Create approval queue format.
6. Create first 20–30 short-form concepts.
7. Create first 10 paid ad concepts, but do not spend until tracking is verified.
8. Create 5 SEO page outlines.

## Week 1 — Approval-only launch

Goal: publish controlled experiments, not random content.

Rules:
- Every post/ad requires approval before publishing.
- Max spend: €20/day total.
- If Meta/TikTok paid is blocked, run 100% organic + SEO + waitlist funnel.

Execution:
1. Prepare 7 days of approved content.
2. Publish/schedule only approved posts.
3. Reply to comments manually.
4. Track every post with unique UTM.
5. Log performance daily.

Paid split if accounts are available:
- €10/day Meta
- €10/day TikTok

If not available:
- €0 paid
- organic TikTok/IG + SEO + communities only

## Week 2 — Learning loop

Review weekly:
- CTR
- signup rate
- cost per signup if paid is active
- best hooks
- best audiences
- comments/replies
- saves/shares

Actions:
- repeat winners
- kill losers
- create variants around winning hooks
- update approval queue

## Blockers

1. No app store links
   - Current solution: focus on waitlist/signup.
2. Meta personal accounts blocked
   - Current solution: clean Business Manager via team member, agency/partner, or appeal. No shady bypasses.
3. TikTok verification pending
   - Current solution: build content backlog while waiting.
4. Few/no content assets
   - Current solution: AI content sets + product mockups.
5. Tracking must be verified before paid spend
   - Current solution: PostHog dashboard and test events first.

## Approval queue template

```text
Concept ID:
Channel:
Audience:
Hook:
Script/caption:
Visual prompt:
CTA:
UTM link:
Risk check:
- No source/data platform names: yes/no
- No unsupported claims: yes/no
- No misleading visuals: yes/no
- CTA correct: yes/no
- UTM correct: yes/no
Approved by Hicham: yes/no
Status: draft / approved / posted / killed
Results:
- views:
- clicks:
- signups/waitlist:
- WhatsApp opt-ins:
- notes:
```

## Immediate next actions

1. Verify deployed PostHog events on `nestd.nl`.
2. Create/confirm PostHog dashboard.
3. Generate the first 20 approval-ready content concepts.
4. Build UTM links for each concept.
5. Decide whether to add Meta/TikTok pixels now or stay PostHog-only until ad accounts are ready.
6. Identify who can own a clean Meta Business Manager.
