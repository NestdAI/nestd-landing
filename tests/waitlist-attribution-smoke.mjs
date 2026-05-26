import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');

function extractIife(name) {
  const start = source.indexOf(`(function ${name}()`);
  assert.notEqual(start, -1, `${name} IIFE not found`);
  const end = source.indexOf('\n})();', start);
  assert.notEqual(end, -1, `${name} IIFE end not found`);
  return source.slice(start, end + '\n})();'.length);
}

function makeStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function analyticsContext({ href, referrer, localStorage, sessionStorage }) {
  const location = new URL(href);
  const document = {
    referrer,
    documentElement: { lang: 'nl' },
    querySelector: () => null,
    createElement: () => ({}),
    getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
    head: { appendChild() {} },
  };
  const window = {
    location,
    localStorage,
    sessionStorage,
    NESTD_META_PIXEL_ID: '',
    NESTD_POSTHOG_KEY: '',
  };

  return vm.createContext({
    console,
    Date,
    URL,
    URLSearchParams,
    document,
    localStorage,
    sessionStorage,
    window,
  });
}

const analyticsIife = extractIife('initMarketingAnalytics');
const localStorageRef = makeStorage();
const sessionStorageRef = makeStorage();

vm.runInContext(analyticsIife, analyticsContext({
  href: 'https://nestd.nl/?utm_source=meta&utm_medium=paid_social&utm_campaign=first&fbclid=fb-1',
  referrer: 'https://instagram.com/some/path?ignored=true',
  localStorage: localStorageRef,
  sessionStorage: sessionStorageRef,
}));

const secondContext = analyticsContext({
  href: 'https://nestd.nl/pricing.html?utm_source=google&utm_medium=cpc&utm_campaign=current&gclid=g-1',
  referrer: 'https://nestd.nl/?listing=private',
  localStorage: localStorageRef,
  sessionStorage: sessionStorageRef,
});
vm.runInContext(analyticsIife, secondContext);

const attribution = secondContext.window.nestdAnalytics.getWaitlistAttribution();
assert.equal(attribution.source, 'landing');
assert.equal(attribution.utm_source, 'google');
assert.equal(attribution.current_touch_utm_source, 'google');
assert.equal(attribution.first_touch_utm_source, 'meta');
assert.equal(attribution.current_touch?.utm_campaign, 'current');
assert.equal(attribution.first_touch?.utm_campaign, 'first');
assert.equal(attribution.current_touch?.landing_page, 'https://nestd.nl/pricing.html');
assert.equal(attribution.first_touch?.landing_page, 'https://nestd.nl/');
assert.ok(attribution.current_touch?.captured_at);
assert.ok(attribution.first_touch?.captured_at);

const tracked = [];
let submitHandler;
const input = { value: 'rate@example.com' };
const button = { disabled: false, textContent: '' };
const messageEl = { textContent: '', className: 'form-msg', classList: { contains: (className) => className === 'form-msg' } };
const form = {
  dataset: { placement: 'hero' },
  nextElementSibling: messageEl,
  querySelector(selector) {
    if (selector === 'input[type="email"]') return input;
    if (selector === 'button[type="submit"]') return button;
    return null;
  },
  closest: () => null,
  reset() {},
  addEventListener(_event, handler) {
    submitHandler = handler;
  },
};

const waitlistContext = vm.createContext({
  console,
  currentLang: 'nl',
  translations: {},
  document: { querySelectorAll: () => [form], documentElement: { lang: 'nl' } },
  window: {
    nestdAnalytics: {
      getWaitlistAttribution: () => ({
        source: 'landing',
        first_touch: { utm_source: 'meta' },
        current_touch: { utm_source: 'google' },
      }),
      track: (event, properties) => tracked.push([event, properties]),
      trackMeta: () => {},
    },
  },
  fetch: async () => ({
    ok: false,
    status: 429,
    clone() {
      return this;
    },
    async json() {
      return { success: false, error: { code: 'RATE_LIMITED' } };
    },
  }),
});

vm.runInContext(extractIife('initWaitlistForms'), waitlistContext);
assert.equal(typeof submitHandler, 'function');
await submitHandler({ preventDefault() {}, currentTarget: form });
assert.equal(
  JSON.stringify(tracked.find(([event]) => event === 'waitlist_signup_failed')),
  JSON.stringify(['waitlist_signup_failed', { reason: 'rate_limited', placement: 'hero' }]),
);

const successTracked = [];
let successSubmitHandler;
const successInput = { value: 'success@example.com' };
const successButton = { disabled: false, textContent: '' };
const successMessageEl = { textContent: '', className: 'form-msg', classList: { contains: (className) => className === 'form-msg' } };
const successForm = {
  dataset: { placement: 'hero' },
  nextElementSibling: successMessageEl,
  querySelector(selector) {
    if (selector === 'input[type="email"]') return successInput;
    if (selector === 'button[type="submit"]') return successButton;
    return null;
  },
  closest: () => null,
  reset() {
    successInput.value = '';
  },
  addEventListener(_event, handler) {
    successSubmitHandler = handler;
  },
};

const successContext = vm.createContext({
  console,
  currentLang: 'nl',
  translations: {
    nl: {
      submitLoading: 'Even geduld...',
      submitBtn: 'Claim je plek',
      successMsg: '🎉 Je staat op de lijst! Als je bij de eerste 100 zit, krijg je 1 maand Pro gratis.',
    },
  },
  document: { querySelectorAll: () => [successForm], documentElement: { lang: 'nl' } },
  window: {
    nestdAnalytics: {
      getWaitlistAttribution: () => ({ source: 'landing' }),
      track: (event, properties) => successTracked.push(['posthog', event, properties]),
      trackMeta: (event, properties) => successTracked.push(['meta', event, properties]),
    },
  },
  fetch: async () => ({
    ok: true,
    status: 200,
    clone() {
      return this;
    },
    async json() {
      return { success: true };
    },
  }),
});

vm.runInContext(extractIife('initWaitlistForms'), successContext);
assert.equal(typeof successSubmitHandler, 'function');
await successSubmitHandler({ preventDefault() {}, currentTarget: successForm });
assert.equal(successMessageEl.textContent, '🎉 Je staat op de lijst! Als je bij de eerste 100 zit, krijg je 1 maand Pro gratis.');
assert.equal(successMessageEl.className, 'form-msg success');
assert.ok(successTracked.some(([kind, event]) => kind === 'posthog' && event === 'waitlist_signup_completed'));
assert.ok(successTracked.some(([kind, event]) => kind === 'meta' && event === 'Lead'));
assert.equal(successButton.textContent, 'Claim je plek');

console.log('waitlist attribution smoke passed');
