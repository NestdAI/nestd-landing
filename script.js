// Marketing telemetry only. Native links never wait for analytics.
(function initMarketingAnalytics() {
  const POSTHOG_KEY = window.NESTD_POSTHOG_KEY ?? document.querySelector('meta[name="posthog-key"]')?.content ?? '';
  const META_PIXEL_ID = window.NESTD_META_PIXEL_ID ?? document.querySelector('meta[name="facebook-pixel-id"]')?.content ?? '1435983921187208';
  const APP_STORE_URL = 'https://apps.apple.com/nl/app/nestd/id6761392857';
  const FIRST_TOUCH_KEY = 'nestd_attribution_first_touch_v1';
  const CURRENT_TOUCH_KEY = 'nestd_attribution_current_touch_v1';
  const CAMPAIGN_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
  const PUBLIC_PATHS = new Set(['/', '/index.html', '/en', '/en/', '/about.html', '/pricing.html', '/privacy.html', '/app', '/app/', '/app/index.html']);
  const PLACEMENTS = new Set(['hero', 'nav', 'mid_page', 'bottom', 'mobile_sticky']);
  const SECTIONS = {
    how_it_works: 'how_it_works_section_viewed', alerts: 'whatsapp_alerts_section_viewed',
    filters: 'filters_section_viewed', pricing: 'pricing_section_viewed', faq: 'faq_section_viewed', download: 'download_section_viewed',
  };
  const EVENTS = new Set(['page_view', 'cta_clicked', 'navigation_clicked', 'theme_toggled',
    'app_deeplink_viewed', 'app_deeplink_fallback_shown', 'app_deeplink_opened', ...Object.values(SECTIONS)]);
  const CONTENT_NAMES = new Set(['app_store_cta', ...Object.keys(SECTIONS)]);
  const publicPage = PUBLIC_PATHS.has(window.location.pathname);
  const queue = [];
  let posthogReady = false;

  // Campaigns are identifiers, not free text. Do not put user data into campaign names.
  function campaignValue(value) {
    return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,199}$/.test(value) ? value : undefined;
  }
  function safeUrl(value) {
    if (typeof value !== 'string' || !value) return undefined;
    try {
      const url = new URL(value, window.location.origin);
      if (!/^https?:$/.test(url.protocol) || url.username || url.password || /@|%40/i.test(url.hostname)) return undefined;
      // External and product-route paths can contain personal data: retain only the origin.
      const path = url.origin === window.location.origin && PUBLIC_PATHS.has(url.pathname) ? url.pathname : '/';
      return `${url.origin}${path}`;
    } catch { return undefined; }
  }
  function compact(object) {
    return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== ''));
  }
  function attributionSnapshot(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const clean = {};
    for (const key of CAMPAIGN_FIELDS) clean[key] = campaignValue(value[key]);
    clean.landing_page = safeUrl(value.landing_page);
    clean.referrer = safeUrl(value.referrer);
    if (typeof value.captured_at === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.captured_at)) clean.captured_at = value.captured_at;
    return compact(clean);
  }
  function browserStorage(kind) {
    try { return window[kind]; } catch { return null; }
  }
  function readTouch(kind, key) {
    try {
      const raw = browserStorage(kind)?.getItem(key);
      if (!raw) return null;
      const value = attributionSnapshot(JSON.parse(raw));
      return Object.keys(value).length ? value : null;
    } catch { return null; }
  }
  function writeTouch(kind, key, value) {
    try { browserStorage(kind)?.setItem(key, JSON.stringify(value)); } catch { /* Blocked storage must not affect downloads. */ }
  }
  const params = new URLSearchParams(window.location.search);
  const pageTouch = attributionSnapshot({
    ...Object.fromEntries(CAMPAIGN_FIELDS.map(key => [key, params.get(key)])),
    landing_page: window.location.href, referrer: document.referrer, captured_at: new Date().toISOString(),
  });
  const firstTouch = readTouch('localStorage', FIRST_TOUCH_KEY) || pageTouch;
  const previousCurrent = readTouch('sessionStorage', CURRENT_TOUCH_KEY);
  const currentTouch = !previousCurrent || CAMPAIGN_FIELDS.some(key => pageTouch[key]) ? pageTouch : previousCurrent;
  if (publicPage) {
    // Rewrite stored data through the same sanitizer, including pre-existing values.
    writeTouch('localStorage', FIRST_TOUCH_KEY, firstTouch);
    writeTouch('sessionStorage', CURRENT_TOUCH_KEY, currentTouch);
  }
  function getAttribution() {
    const first = readTouch('localStorage', FIRST_TOUCH_KEY) || firstTouch;
    const current = readTouch('sessionStorage', CURRENT_TOUCH_KEY) || currentTouch;
    const prefixed = (prefix, touch) => Object.fromEntries(Object.entries(touch).map(([key, value]) => [`${prefix}_${key}`, value]));
    return compact({
      path: publicPage ? window.location.pathname : undefined,
      url: safeUrl(window.location.href), language: document.documentElement.lang === 'en' ? 'en' : 'nl',
      ...current, ...prefixed('first_touch', first), ...prefixed('current_touch', current),
      first_touch: first, current_touch: current,
    });
  }
  function eventProperties(properties = {}) {
    if (!properties || typeof properties !== 'object') return {};
    const clean = {};
    if (PLACEMENTS.has(properties.placement)) clean.placement = properties.placement;
    if (CONTENT_NAMES.has(properties.content_name)) clean.content_name = properties.content_name;
    if (['app_download', 'landing_section'].includes(properties.content_category)) clean.content_category = properties.content_category;
    if (['nav', 'mobile_nav', 'footer'].includes(properties.location)) clean.location = properties.location;
    if (['home', 'how_it_works', 'faq', 'about', 'pricing', 'privacy', 'contact'].includes(properties.destination)) clean.destination = properties.destination;
    if (['light', 'dark'].includes(properties.theme)) clean.theme = properties.theme;
    if (properties.href === APP_STORE_URL) clean.href = APP_STORE_URL;
    return clean;
  }
  function beforeSend(event) {
    if (!event || !EVENTS.has(event.event) || !publicPage) return null;
    // Rebuild after SDK enrichment. No SDK URL, referrer, person properties,
    // arbitrary nested data, or persisted super-properties reach the transport.
    const properties = { ...getAttribution(), ...eventProperties(event.properties), token: POSTHOG_KEY,
      $process_person_profile: false, $is_identified: false };
    if (['nl', 'en'].includes(event.properties?.language)) properties.language = event.properties.language;
    for (const key of ['distinct_id', '$device_id', '$session_id', '$window_id']) {
      const value = event.properties?.[key];
      if (typeof value === 'string' && /^[a-f0-9-]{20,80}$/i.test(value)) properties[key] = value;
    }
    return { ...event, properties };
  }
  function safeMetaUrl(value, isPage = false) {
    if (!value) return true;
    try {
      const url = new URL(value, window.location.origin);
      if (!/^https?:$/.test(url.protocol) || url.username || url.password) return false;
      if ((isPage || url.origin === window.location.origin) && !PUBLIC_PATHS.has(url.pathname)) return false;
      if (url.origin !== window.location.origin && url.pathname !== '/') return false;
      if (/@|%40|%2540/i.test(url.href)) return false;
      if (url.hash && !/^#(?:how-it-works|how_it_works|hoe-het-werkt|alerts|filters|pricing|prijzen|faq|vragen|download|main|contact|cookies)$/.test(url.hash)) return false;
      for (const [key, value] of url.searchParams) {
        if (key === 'lang' && ['nl', 'en'].includes(value)) continue;
        if (!CAMPAIGN_FIELDS.includes(key) || !campaignValue(value)) return false;
      }
      return true;
    } catch { return false; }
  }
  function metaAllowed() {
    return publicPage && safeMetaUrl(window.location.href, true) && safeMetaUrl(document.referrer);
  }
  function trackMeta(event, properties = {}) {
    if (!META_PIXEL_ID || !window.fbq || !metaAllowed() || !['PageView', 'ViewContent'].includes(event)) return;
    const safe = eventProperties(properties);
    const payload = compact({ content_name: safe.content_name, content_category: safe.content_category, placement: safe.placement });
    try { window.fbq('track', event, payload); } catch { /* Marketing is optional. */ }
  }
  function capture(event, payload) {
    try { window.posthog.capture(event, payload, { transport: 'sendBeacon', send_instantly: true }); } catch { /* Never block native navigation. */ }
  }
  window.nestdAnalytics = {
    track(event, properties = {}) {
      if (!publicPage || !EVENTS.has(event)) return;
      const payload = { ...getAttribution(), ...eventProperties(properties) };
      if (posthogReady) capture(event, payload);
      else if (POSTHOG_KEY && queue.length < 100) queue.push([event, payload]);
    }, trackMeta, getAttribution,
  };

  if (META_PIXEL_ID && metaAllowed()) {
    if (!window.fbq) {
      const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
      window.fbq = fbq; window._fbq = window._fbq || fbq;
      const script = document.createElement('script');
      script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
      // Disable automatic button/form metadata collection; only explicit events above are sent.
      fbq('set', 'autoConfig', false, META_PIXEL_ID);
      fbq('init', META_PIXEL_ID);
    }
    trackMeta('PageView');
  }
  if (POSTHOG_KEY && publicPage) {
    const script = document.createElement('script');
    script.async = true; script.src = 'https://eu-assets.i.posthog.com/static/array.js';
    script.onload = () => {
      if (!window.posthog?.init || !window.posthog?.capture) return;
      try {
        window.posthog.init(POSTHOG_KEY, {
          api_host: 'https://eu.i.posthog.com', defaults: '2026-01-30',
          capture_pageview: false, capture_pageleave: false, autocapture: false,
          disable_session_recording: true, capture_exceptions: false,
          capture_performance: false, capture_heatmaps: false, capture_dead_clicks: false,
          disable_surveys: true, advanced_disable_flags: true,
          person_profiles: 'never', before_send: beforeSend,
        });
        posthogReady = true;
        window.nestdAnalytics.track('page_view');
        while (queue.length) capture(...queue.shift());
      } catch { /* Downloads also work with blocked or failed analytics. */ }
    };
    document.head.appendChild(script);
  }

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a');
    if (!link) return;
    if (link.getAttribute('href') === APP_STORE_URL && PLACEMENTS.has(link.dataset.ctaPlacement)) {
      const properties = { content_name: 'app_store_cta', content_category: 'app_download',
        placement: link.dataset.ctaPlacement, href: APP_STORE_URL };
      window.nestdAnalytics.track('cta_clicked', properties);
      trackMeta('ViewContent', properties);
      return;
    }
    const container = link.closest('nav, footer, .navbar, .navbar-mobile, .page-footer');
    if (!container) return;
    const raw = link.getAttribute('href') || '';
    let destination;
    try {
      const url = new URL(raw, window.location.href);
      if (url.protocol === 'mailto:') destination = 'contact';
      else if (url.origin === window.location.origin) {
        destination = ({ '/': 'home', '/index.html': 'home', '/about.html': 'about', '/pricing.html': 'pricing', '/privacy.html': 'privacy' })[url.pathname];
        if (['#faq', '#vragen'].includes(url.hash)) destination = 'faq';
        if (['#how-it-works', '#how_it_works', '#hoe-het-werkt'].includes(url.hash)) destination = 'how_it_works';
      }
    } catch { return; }
    if (destination) window.nestdAnalytics.track('navigation_clicked', {
      destination, location: link.closest('footer, .page-footer') ? 'footer' : link.closest('#mobile-menu, .navbar-mobile') ? 'mobile_nav' : 'nav',
    });
  });

  if (typeof IntersectionObserver !== 'undefined') {
    const viewed = new Set();
    const observer = new IntersectionObserver((entries, instance) => {
      for (const entry of entries) {
        const section = entry.target.dataset.section;
        if (!entry.isIntersecting || !Object.hasOwn(SECTIONS, section) || viewed.has(section)) continue;
        viewed.add(section);
        window.nestdAnalytics.track(SECTIONS[section]);
        trackMeta('ViewContent', { content_name: section, content_category: 'landing_section' });
        instance.unobserve(entry.target);
      }
    }, { threshold: 0.25 });
    document.querySelectorAll('[data-section]').forEach(section => {
      if (Object.hasOwn(SECTIONS, section.dataset.section)) observer.observe(section);
    });
  }
})();

// Compatibility for the legal page; the new landing has no theme control.
(function initLegacyTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  let saved;
  try { saved = window.localStorage.getItem('nestd-theme'); } catch { /* Optional preference. */ }
  function applyTheme(theme) {
    const light = theme === 'light';
    document.body.classList.toggle('light', light);
    toggle.textContent = light ? '🌙' : '☀️';
  }
  applyTheme(saved || (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  toggle.addEventListener('click', () => {
    const theme = document.body.classList.contains('light') ? 'dark' : 'light';
    applyTheme(theme);
    try { window.localStorage.setItem('nestd-theme', theme); } catch { /* Optional preference. */ }
    window.nestdAnalytics?.track('theme_toggled', { theme });
  });
})();
