import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../i18n.js', import.meta.url), 'utf8');

function makeStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

function makeI18nElement(key, kind = 'text') {
  return {
    textContent: '',
    innerHTML: '',
    placeholder: '',
    getAttribute(attribute) {
      if (attribute === 'data-i18n' && kind === 'text') return key;
      if (attribute === 'data-i18n-html' && kind === 'html') return key;
      if (attribute === 'data-i18n-placeholder' && kind === 'placeholder') return key;
      return null;
    },
  };
}

const location = new URL('https://nestd.nl/?lang=en&utm_source=meta&utm_medium=paid_social&utm_campaign=expats');
const localStorage = makeStorage({ 'nestd-lang': 'nl' });
const htmlElements = [makeI18nElement('heroTitle', 'html')];
const textElements = [makeI18nElement('heroSub'), makeI18nElement('footer_desc')];
const placeholderElements = [];
const langButton = { textContent: '', addEventListener(_event, handler) { this.click = handler; } };
let replacedUrl = null;

const document = {
  title: '',
  documentElement: {
    lang: 'nl',
    classList: { remove() {} },
  },
  querySelectorAll(selector) {
    if (selector === '[data-i18n]') return textElements;
    if (selector === '[data-i18n-html]') return htmlElements;
    if (selector === '[data-i18n-placeholder]') return placeholderElements;
    return [];
  },
  getElementById(id) {
    return id === 'lang-toggle' ? langButton : null;
  },
  addEventListener(event, handler) {
    if (event === 'DOMContentLoaded') handler();
  },
};

const context = vm.createContext({
  URL,
  URLSearchParams,
  location,
  localStorage,
  document,
  window: {
    location,
    history: {
      replaceState(_state, _title, nextUrl) {
        replacedUrl = new URL(nextUrl, location.origin).href;
        location.href = replacedUrl;
      },
    },
  },
});

vm.runInContext(source, context);

assert.equal(document.documentElement.lang, 'en', 'valid ?lang=en should win over stored Dutch preference');
assert.match(htmlElements[0].innerHTML, /Stop refreshing/i, 'English hero copy should render on first load');
assert.match(textElements[1].textContent, /Your personal AI housing assistant/i, 'English footer copy should render on first load');
assert.equal(localStorage.getItem('nestd-lang'), 'en', 'resolved URL language should persist for later visits');
assert.equal(langButton.textContent, '🇳🇱', 'toggle should offer Dutch while English is active');

langButton.click();

assert.equal(document.documentElement.lang, 'nl', 'manual toggle should switch back to Dutch');
assert.equal(localStorage.getItem('nestd-lang'), 'nl', 'manual toggle should update stored language');
assert.equal(langButton.textContent, '🇬🇧', 'toggle should offer English while Dutch is active');
const toggledUrl = new URL(replacedUrl);
assert.equal(toggledUrl.searchParams.get('lang'), 'nl', 'manual toggle should update the lang query param');
assert.equal(toggledUrl.searchParams.get('utm_source'), 'meta', 'manual toggle should preserve UTM source');
assert.equal(toggledUrl.searchParams.get('utm_medium'), 'paid_social', 'manual toggle should preserve UTM medium');
assert.equal(toggledUrl.searchParams.get('utm_campaign'), 'expats', 'manual toggle should preserve UTM campaign');

console.log('i18n language URL smoke passed');
