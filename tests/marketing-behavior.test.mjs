import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const analyticsSource = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const landingSource = fs.existsSync(new URL('../landing.js', import.meta.url))
  ? fs.readFileSync(new URL('../landing.js', import.meta.url), 'utf8') : '';
const STORE = 'https://apps.apple.com/nl/app/nestd/id6761392857';
const FIRST = 'nestd_attribution_first_touch_v1';
const CURRENT = 'nestd_attribution_current_touch_v1';

export function storage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)) };
}
function element(tagName = 'SPAN', attributes = {}) {
  const listeners = {};
  const el = { tagName, attributes: { ...attributes }, dataset: {}, textContent: '', hidden: false, style: {},
    classList: { toggle() {}, contains: () => false, remove() {} },
    getAttribute: name => el.attributes[name] ?? null,
    setAttribute: (name, value) => { el.attributes[name] = String(value); },
    addEventListener: (name, fn) => { listeners[name] = fn; },
    fire: (name, event = {}) => listeners[name]?.(event),
    focus() { el.focused = true; }, contains: other => other === el,
    closest(selector) { return ['a', 'a, button'].includes(selector) && el.tagName === 'A' ? el : null; },
    matches: () => false, querySelectorAll: () => [],
    getBoundingClientRect: () => ({ top: 0, bottom: 50 }) };
  for (const [name, value] of Object.entries(attributes)) {
    if (name.startsWith('data-')) el.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  return el;
}

export function environment({ href = 'https://nestd.nl/', referrer = '', local = storage(), session = storage(), blockedStorage = false, key = 'phc_test', elements = [], ids = {}, sdkExtra = {} } = {}) {
  const location = new URL(href);
  const sent = [], meta = [], scripts = [], listeners = {}, observers = [];
  const document = {
    referrer, title: '', documentElement: { lang: 'nl', classList: { remove() {} } }, body: element('BODY'),
    head: { appendChild: node => scripts.push(node) },
    createElement: tag => element(tag.toUpperCase()),
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
    querySelectorAll(selector) {
      if (selector === 'a[href]') return elements.filter(el => el.tagName === 'A');
      if (selector === '[data-nl][data-en]') return elements.filter(el => el.dataset.nl && el.dataset.en);
      if (selector === '[data-alt-nl][data-alt-en]') return elements.filter(el => el.dataset.altNl && el.dataset.altEn);
      if (selector === '[data-aria-nl][data-aria-en]') return elements.filter(el => el.dataset.ariaNl && el.dataset.ariaEn);
      if (selector === '[data-section]') return elements.filter(el => el.dataset.section);
      if (selector === '[data-sticky-cta]') return elements.filter(el => el.getAttribute('data-sticky-cta') !== null);
      if (selector === '[data-cta-placement="hero"]') return elements.filter(el => el.dataset.ctaPlacement === 'hero');
      if (selector === '[data-cta-placement="bottom"]') return elements.filter(el => el.dataset.ctaPlacement === 'bottom');
      return [];
    },
    getElementById: id => ids[id] ?? null,
    getElementsByTagName: () => [{ parentNode: { insertBefore: node => scripts.push(node) } }],
    addEventListener(name, fn) { (listeners[name] ||= []).push(fn); },
  };
  const window = { location, document, localStorage: local, sessionStorage: session,
    NESTD_POSTHOG_KEY: key, NESTD_META_PIXEL_ID: 'test-pixel', innerHeight: 800,
    history: { replaceState(_state, _title, next) { location.href = new URL(next, location).href; } },
    addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: fn => fn(),
    fbq: (...args) => meta.push(args),
  };
  if (blockedStorage) for (const name of ['localStorage', 'sessionStorage']) Object.defineProperty(window, name, { get() { throw new Error('blocked'); } });
  let config;
  window.posthog = {
    init(_key, options) { config = options; },
    capture(event, properties, options) {
      // Simulate SDK enrichment after caller capture but before transport.
      const payload = { event, properties: { distinct_id: '019ce104-1234-7123-8aab-6f401adab123', $device_id: '019ce104-1234-7123-8aab-6f401adab123', ...properties, ...sdkExtra } };
      const result = config?.before_send ? config.before_send(payload) : payload;
      if (result) sent.push({ ...result, options });
    },
  };
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); }
    unobserve(target) { this.targets = this.targets.filter(value => value !== target); }
  }
  const context = vm.createContext({ window, document, location, localStorage: local, sessionStorage: session, URL, URLSearchParams, Date, console, IntersectionObserver, setTimeout, clearTimeout });
  return { window, document, sent, meta, scripts, observers, context,
    get config() { return config; },
    runLanding() { vm.runInContext(landingSource, context); },
    runAnalytics() { vm.runInContext(analyticsSource, context); },
    loadSdk() { scripts.find(node => node.src?.includes('posthog.com'))?.onload(); },
    fire(name, event) { listeners[name]?.forEach(fn => fn(event)); },
  };
}

// Removing URL precedence or a translated attribute must break the rendered output.
test('language changes text, metadata and accessible names without losing campaign or hash', () => {
  const text = element('H1', { 'data-nl': 'Een woningmelding', 'data-en': 'A rental alert' });
  const title = element('TITLE', { 'data-nl': 'Nestd — meldingen', 'data-en': 'Nestd — alerts' });
  const description = element('META', { 'data-nl': 'Snel op de hoogte', 'data-en': 'Hear about new rentals' });
  const image = element('IMG', { 'data-alt-nl': 'Voorbeeld', 'data-alt-en': 'Example' });
  const control = element('BUTTON', { 'data-aria-nl': 'Open menu', 'data-aria-en': 'Open navigation' });
  const internal = element('A', { href: '/about.html?utm_source=owned#contact' });
  const store = element('A', { href: STORE });
  const toggle = element('BUTTON');
  const env = environment({ href: 'https://nestd.nl/?lang=en&utm_source=meta#faq', local: storage({ 'nestd-lang': 'nl' }), elements: [text, title, description, image, control, internal, store], ids: { 'lang-toggle': toggle } });
  env.runLanding();
  assert.equal(env.document.documentElement.lang, 'en');
  assert.equal(text.textContent, 'A rental alert');
  assert.equal(title.textContent, 'Nestd — alerts');
  assert.equal(description.getAttribute('content'), 'Hear about new rentals');
  assert.equal(image.getAttribute('alt'), 'Example');
  assert.equal(control.getAttribute('aria-label'), 'Open navigation');
  assert.equal(new URL(internal.getAttribute('href'), env.window.location).searchParams.get('lang'), 'en');
  assert.equal(store.getAttribute('href'), STORE);
  toggle.fire('click');
  assert.equal(text.textContent, 'Een woningmelding');
  assert.equal(env.window.location.searchParams.get('lang'), 'nl');
  assert.equal(env.window.location.searchParams.get('utm_source'), 'meta');
  assert.equal(env.window.location.hash, '#faq');
  assert.equal(env.window.localStorage.getItem('nestd-lang'), 'nl');
});

test('language precedence covers path, stored preference, invalid query and blocked storage', () => {
  for (const [href, stored, blockedStorage, expected] of [
    ['https://nestd.nl/en/?lang=nl', 'en', false, 'nl'],
    ['https://nestd.nl/en/', 'nl', false, 'en'],
    ['https://nestd.nl/?lang=invalid', 'en', false, 'en'],
    ['https://nestd.nl/', 'en', false, 'en'],
    ['https://nestd.nl/?lang=en', 'nl', true, 'en'],
    ['https://nestd.nl/', 'invalid', true, 'nl'],
  ]) {
    const env = environment({ href, local: storage({ 'nestd-lang': stored }), blockedStorage });
    env.runLanding();
    assert.equal(env.document.documentElement.lang, expected, href);
  }
});

test('mobile navigation closes on Escape with focus returned and on a link click', () => {
  const menu = element('NAV'); menu.hidden = true;
  const toggle = element('BUTTON', { 'aria-expanded': 'false' });
  const env = environment({ ids: { 'menu-toggle': toggle, 'mobile-menu': menu } });
  env.runLanding(); toggle.fire('click');
  assert.equal(menu.hidden, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  env.fire('keydown', { key: 'Escape' });
  assert.equal(menu.hidden, true); assert.equal(toggle.focused, true);
  toggle.fire('click'); const link = element('A', { href: '#faq' });
  menu.contains = target => target === link;
  env.fire('click', { target: link });
  assert.equal(menu.hidden, true);
});

test('first touch survives a new campaign while current touch survives untagged navigation', () => {
  const local = storage(), session = storage();
  const visit = href => { const env = environment({ href, local, session, referrer: 'https://instagram.com/path?email=secret@example.com' }); env.runAnalytics(); return env; };
  visit('https://nestd.nl/?utm_source=meta&utm_campaign=first&fbclid=fb-1');
  visit('https://nestd.nl/pricing.html?utm_source=google&utm_campaign=current&gclid=g-1');
  const env = visit('https://nestd.nl/about.html?lang=en');
  const payload = env.window.nestdAnalytics.getAttribution();
  assert.equal(payload.first_touch_utm_source, 'meta');
  assert.equal(payload.utm_source, 'google');
  assert.equal(payload.current_touch.utm_campaign, 'current');
  assert.equal(payload.first_touch.landing_page, 'https://nestd.nl/');
  assert.equal(payload.current_touch.landing_page, 'https://nestd.nl/pricing.html');
  assert.equal(payload.first_touch.referrer, 'https://instagram.com/');
  assert.equal(JSON.parse(local.getItem(FIRST)).utm_campaign, 'first');
  assert.equal(JSON.parse(session.getItem(CURRENT)).utm_campaign, 'current');
});

test('one native App Store click emits intent once, with no preventDefault or label capture', () => {
  const env = environment(); env.runAnalytics();
  const link = element('A', { href: STORE, 'data-cta-placement': 'hero' }); link.textContent = 'private@example.com';
  let prevented = false;
  env.fire('click', { target: link, preventDefault() { prevented = true; } });
  env.loadSdk();
  const clicks = env.sent.filter(row => row.event === 'cta_clicked');
  assert.equal(clicks.length, 1); assert.equal(prevented, false);
  assert.equal(clicks[0].properties.content_name, 'app_store_cta');
  assert.equal(clicks[0].properties.href, STORE);
  assert.equal(clicks[0].properties.placement, 'hero');
  assert.equal(clicks[0].properties.label, undefined);
  assert.equal(clicks[0].options.transport, 'sendBeacon');
  assert.equal(clicks[0].options.send_instantly, true);
  assert.equal(env.sent.filter(row => row.event === 'page_view').length, 1);
  assert.equal(env.meta.filter(row => row[1] === 'ViewContent').length, 1);
  assert.equal(env.meta.filter(row => ['Lead', 'Purchase', 'Subscribe'].includes(row[1])).length, 0);
});

test('arbitrary event props and SDK enrichment cannot leak preferences, email or sensitive URLs', () => {
  const env = environment({ href: 'https://nestd.nl/?email=secret@example.com&city=Utrecht&utm_source=meta', referrer: 'https://search.example/private@example.com?budget=1400', sdkExtra: {
    $current_url: 'https://nestd.nl/?email=secret@example.com', $referrer: 'https://nestd.nl/listing/private-id',
    $initial_current_url: 'https://nestd.nl/?city=Utrecht', $set: { email: 'secret@example.com' },
    $set_once: { $initial_referrer: 'https://nestd.nl/?city=Utrecht' },
    $initial_utm_campaign: 'private@example.com', preferences: { city: 'Utrecht', budget: 1400 },
  } });
  env.runAnalytics(); env.loadSdk();
  env.window.nestdAnalytics.track('cta_clicked', { placement: 'hero', email: 'secret@example.com', nested: { preferences: { city: 'Utrecht' } }, first_touch: { utm_source: 'private@example.com' }, label: 'secret@example.com', href: 'mailto:private@example.com', content_name: { email: 'secret@example.com' } });
  env.window.nestdAnalytics.track('secret@example.com', { city: 'Utrecht' });
  assert.equal(typeof env.config.before_send, 'function');
  assert.equal(env.config.autocapture, false); assert.equal(env.config.capture_pageview, false);
  assert.equal(env.config.capture_pageleave, false); assert.equal(env.config.disable_session_recording, true);
  assert.equal(env.config.person_profiles, 'never');
  assert.equal(env.config.advanced_disable_flags, true, 'the flags endpoint bypasses the event redaction hook');
  const json = JSON.stringify(env.sent);
  assert.doesNotMatch(json, /secret@|private@|Utrecht|1400|private-id|preferences|\$set|\$current_url|\$referrer/);
  assert.equal(env.sent.length, 2);
  assert.equal(env.sent[1].properties.utm_source, 'meta');
  assert.equal(env.sent[1].properties.placement, 'hero');
  assert.ok(env.sent[1].properties.distinct_id);
});

test('stored malformed attribution and sensitive campaign values are scrubbed before capture', () => {
  const local = storage({ [FIRST]: JSON.stringify({ utm_source: 'meta', email: 'secret@example.com', utm_campaign: { preferences: { city: 'Utrecht' } }, landing_page: 'https://nestd.nl/listing/private-id?email=secret@example.com' }) });
  const env = environment({ href: 'https://nestd.nl/?utm_campaign=private%40example.com&utm_source=google', local });
  env.runAnalytics(); env.loadSdk();
  assert.equal(env.sent[0].properties.first_touch_utm_source, 'meta');
  assert.doesNotMatch(JSON.stringify(env.sent), /secret@|private@|private-id|Utrecht/);
});

test('blocked storage and unavailable SDK do not break download handling', () => {
  const env = environment({ blockedStorage: true });
  assert.doesNotThrow(() => env.runAnalytics());
  const link = element('A', { href: STORE, 'data-cta-placement': 'hero' });
  assert.doesNotThrow(() => env.fire('click', { target: link }));
  assert.equal(link.getAttribute('href'), STORE);
  assert.ok(env.window.nestdAnalytics.getAttribution().first_touch.captured_at);
});

test('Meta suppresses sensitive page/referrer contexts including external query strings and hashes', () => {
  for (const context of [
    { href: 'https://nestd.nl/?city=Utrecht' },
    { href: 'https://nestd.nl/?utm_campaign=private%40example.com' },
    { href: 'https://nestd.nl/#email=secret@example.com' },
    { referrer: 'https://nestd.nl/listing/private-id' },
    { referrer: 'https://other.example/?email=secret@example.com' },
    { referrer: 'https://other.example/private@example.com' },
  ]) {
    const env = environment(context); env.runAnalytics(); env.loadSdk();
    env.window.nestdAnalytics.trackMeta('ViewContent', { content_name: 'app_store_cta', placement: 'hero' });
    assert.equal(env.meta.length, 0, JSON.stringify(context));
  }
});

test('product paths never initialize analytics even when called directly', () => {
  const env = environment({ href: 'https://nestd.nl/listing/private-id?budget=1400' });
  env.runAnalytics(); env.loadSdk();
  env.window.nestdAnalytics.track('app_deeplink_viewed');
  assert.equal(env.scripts.length, 0); assert.equal(env.sent.length, 0); assert.equal(env.meta.length, 0);
});

test('section events fire once and reject unknown section names', () => {
  const section = element('SECTION', { 'data-section': 'how_it_works' });
  const pricing = element('SECTION', { 'data-section': 'pricing' });
  const bad = element('SECTION', { 'data-section': 'private@example.com' });
  const env = environment({ elements: [section, pricing, bad] }); env.runAnalytics(); env.loadSdk();
  for (const observer of env.observers) {
    const rows = observer.targets.map(target => ({ target, isIntersecting: true }));
    observer.callback(rows, observer); observer.callback(rows, observer);
  }
  assert.equal(env.sent.filter(row => row.event === 'how_it_works_section_viewed').length, 1);
  assert.equal(env.sent.filter(row => row.event === 'pricing_section_viewed').length, 1);
  assert.doesNotMatch(JSON.stringify(env.sent), /private@/);
});

test('unsafe external referrer paths cannot reach the implicit Meta payload', () => {
  const env = environment({ referrer: 'https://other.example/search/Utrecht/1400' });
  env.runAnalytics(); env.loadSdk();
  env.window.nestdAnalytics.trackMeta('ViewContent', { content_name: 'app_store_cta', placement: 'hero' });
  assert.equal(env.meta.length, 0);
  assert.doesNotMatch(JSON.stringify(env.sent), /Utrecht|1400/);
});

test('SDK transport keeps the language at the time of a queued click', () => {
  const env = environment(); env.runAnalytics();
  env.window.nestdAnalytics.track('cta_clicked', { placement: 'hero' });
  env.document.documentElement.lang = 'en';
  env.loadSdk();
  assert.equal(env.sent.find(row => row.event === 'cta_clicked').properties.language, 'nl');
  assert.equal(env.sent.find(row => row.event === 'page_view').properties.language, 'en');
});

test('wrong App Store IDs and non-download links never count as download intent', () => {
  const env = environment(); env.runAnalytics(); env.loadSdk();
  for (const href of ['https://apps.apple.com/app/nestd/id6740091498', 'mailto:private@example.com', '#faq']) {
    const link = element('A', { href, 'data-cta-placement': 'hero' });
    env.fire('click', { target: link });
  }
  assert.equal(env.sent.filter(row => row.event === 'cta_clicked').length, 0);
  assert.doesNotMatch(JSON.stringify(env.sent), /private@|6740091498/);
});

test('navigation captures known destinations without user-controlled labels or hrefs', () => {
  const env = environment(); env.runAnalytics(); env.loadSdk();
  for (const href of ['/about.html?email=secret@example.com#private-id', 'mailto:private@example.com']) {
    const link = element('A', { href }); link.textContent = 'private@example.com';
    link.closest = selector => selector === 'a' ? link : selector.startsWith('nav,') ? element('NAV') : null;
    env.fire('click', { target: link });
  }
  const events = env.sent.filter(row => row.event === 'navigation_clicked');
  assert.equal(events.length, 2);
  assert.deepEqual(events.map(row => row.properties.destination), ['about', 'contact']);
  assert.equal(events[0].properties.location, 'nav');
  assert.doesNotMatch(JSON.stringify(events), /private@|secret@|private-id|mailto:|label/);
});

test('optional mobile action appears only after the hero and yields to the final action', () => {
  const sticky = element('A', { 'data-sticky-cta': '' }); sticky.hidden = true;
  const hero = element('A', { 'data-cta-placement': 'hero' });
  const bottom = element('A', { 'data-cta-placement': 'bottom' });
  let heroBottom = 120, finalTop = 2400, mobile = true;
  hero.getBoundingClientRect = () => ({ bottom: heroBottom });
  bottom.getBoundingClientRect = () => ({ top: finalTop });
  const env = environment({ elements: [sticky, hero, bottom] });
  const listeners = {};
  env.window.addEventListener = (name, fn) => { listeners[name] = fn; };
  env.window.matchMedia = () => ({ matches: mobile });
  env.runLanding(); assert.equal(sticky.hidden, true, 'hero is still visible');
  heroBottom = -100; listeners.scroll(); assert.equal(sticky.hidden, false);
  finalTop = 820; listeners.scroll(); assert.equal(sticky.hidden, true, 'final action is nearly in view');
  finalTop = 2400; mobile = false; listeners.resize(); assert.equal(sticky.hidden, true, 'desktop has no sticky');
});

function runDeeplinkPage(page, options = {}) {
  const html = fs.readFileSync(new URL(`../${page}/index.html`, import.meta.url), 'utf8');
  const ids = { 'open-app': element('A'), redirecting: element('DIV'), fallback: element('DIV') };
  const env = environment({ href: `https://nestd.nl/${page}/`, ...options, ids });
  env.document.documentElement.lang = html.match(/<html[^>]*lang="([a-z]+)"/)?.[1] || 'nl';
  const timers = new Map(); let nextTimer = 1;
  env.context.setTimeout = (callback, delay) => { const id = nextTimer++; timers.set(id, { callback, delay }); return id; };
  env.context.clearTimeout = id => timers.delete(id);
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src = match[1].match(/src="([^"]+)"/)?.[1];
    if (src === '/script.js') env.runAnalytics();
    else if (src === '/landing.js') env.runLanding();
    else if (!src && !/type="application\/ld\+json"/.test(match[1])) vm.runInContext(match[2], env.context);
  }
  return { env, ids, timers };
}

test('app fallback uses the shared privacy boundary while preserving deeplink lifecycle signals', () => {
  const { env, ids, timers } = runDeeplinkPage('app', {
    href: 'https://nestd.nl/app/?email=secret@example.com&city=Utrecht&utm_source=meta',
    referrer: 'https://other.example/?budget=1400',
    sdkExtra: { $current_url: 'https://nestd.nl/app?email=secret@example.com', $set_once: { city: 'Utrecht' } },
  });
  assert.equal(ids['open-app'].href, 'https://nestd.nl/app');
  assert.equal(env.window.location.href, 'https://nestd.nl/app');
  env.loadSdk();
  assert.equal(env.sent.filter(row => row.event === 'app_deeplink_viewed').length, 1);
  assert.equal(typeof env.config.before_send, 'function');
  assert.equal(env.meta.length, 0, 'sensitive original referrer suppresses Meta');
  assert.doesNotMatch(JSON.stringify(env.sent), /secret@|Utrecht|1400|\$current_url|\$set_once/);
  assert.equal(env.sent.find(row => row.event === 'app_deeplink_viewed').properties.utm_source, 'meta');
  assert.equal(timers.size, 1);
  const timer = [...timers.values()][0]; assert.equal(timer.delay, 2500);
  timer.callback();
  assert.equal(ids.redirecting.style.display, 'none'); assert.equal(ids.fallback.style.display, 'block');
  assert.equal(env.sent.filter(row => row.event === 'app_deeplink_fallback_shown').length, 1);
});

test('app opened signal clears fallback without exposing query or referrer values', () => {
  const { env, timers } = runDeeplinkPage('app', { href: 'https://nestd.nl/app/?utm_campaign=download_v1' });
  env.loadSdk(); env.document.hidden = true; env.fire('visibilitychange', {});
  assert.equal(timers.size, 0);
  assert.equal(env.sent.filter(row => row.event === 'app_deeplink_opened').length, 1);
  assert.equal(env.sent.filter(row => row.event === 'app_deeplink_fallback_shown').length, 0);
});

test('listing and verification HTML do not initialize a telemetry transport', () => {
  const listing = runDeeplinkPage('listing', { href: 'https://nestd.nl/listing/private-id?city=Utrecht' });
  assert.equal(listing.ids['open-app'].href, 'https://nestd.nl/listing/private-id');
  assert.equal(listing.env.window.location.href, 'https://nestd.nl/listing/private-id');
  assert.equal(listing.env.scripts.length, 0); assert.equal(listing.env.meta.length, 0);
  const verified = runDeeplinkPage('verified', { href: 'https://nestd.nl/verified/?email=secret@example.com&token=private' });
  assert.equal(verified.env.scripts.length, 0); assert.equal(verified.env.meta.length, 0);
});

test('Dutch section anchors retain safe Meta context and correct navigation destinations', () => {
  for (const [hash, destination] of [['#hoe-het-werkt', 'how_it_works'], ['#vragen', 'faq']]) {
    const env = environment({ href: `https://nestd.nl/${hash}` });
    env.runAnalytics(); env.loadSdk();
    assert.equal(env.meta.filter(row => row[1] === 'PageView').length, 1, hash);
    const link = element('A', { href: hash });
    link.closest = selector => selector === 'a' ? link : selector.startsWith('nav,') ? element('NAV') : null;
    env.fire('click', { target: link });
    assert.equal(env.sent.find(row => row.event === 'navigation_clicked').properties.destination, destination);
  }
});
