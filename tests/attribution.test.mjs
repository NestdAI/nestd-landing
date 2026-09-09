import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(
  new URL("../script.js", import.meta.url),
  "utf8",
);

function extractIife(name) {
  const start = source.indexOf(`(function ${name}()`);
  assert.notEqual(start, -1, `${name} IIFE not found`);
  const end = source.indexOf("\n})();", start);
  assert.notEqual(end, -1, `${name} IIFE end not found`);
  return source.slice(start, end + "\n})();".length);
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
    documentElement: { lang: "nl" },
    querySelector: () => null,
    createElement: () => ({}),
    getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
    head: { appendChild() {} },
  };
  const window = {
    location,
    localStorage,
    sessionStorage,
    NESTD_META_PIXEL_ID: "",
    NESTD_POSTHOG_KEY: "",
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

const analyticsIife = extractIife("initMarketingAnalytics");
const localStorageRef = makeStorage();
const sessionStorageRef = makeStorage();

vm.runInContext(
  analyticsIife,
  analyticsContext({
    href: "https://nestd.nl/?utm_source=meta&utm_medium=paid_social&utm_campaign=first&fbclid=fb-1",
    referrer: "https://instagram.com/some/path?ignored=true",
    localStorage: localStorageRef,
    sessionStorage: sessionStorageRef,
  }),
);

const secondContext = analyticsContext({
  href: "https://nestd.nl/pricing.html?utm_source=google&utm_medium=cpc&utm_campaign=current&gclid=g-1",
  referrer: "https://nestd.nl/?listing=private",
  localStorage: localStorageRef,
  sessionStorage: sessionStorageRef,
});
vm.runInContext(analyticsIife, secondContext);

const attribution =
  secondContext.window.nestdAnalytics.getWaitlistAttribution();
assert.equal(attribution.source, "landing");
assert.equal(attribution.utm_source, "google");
assert.equal(attribution.current_touch_utm_source, "google");
assert.equal(attribution.first_touch_utm_source, "meta");
assert.equal(attribution.current_touch?.utm_campaign, "current");
assert.equal(attribution.first_touch?.utm_campaign, "first");
assert.equal(
  attribution.current_touch?.landing_page,
  "https://nestd.nl/pricing.html",
);
assert.equal(attribution.first_touch?.landing_page, "https://nestd.nl/");
assert.ok(attribution.current_touch?.captured_at);
assert.ok(attribution.first_touch?.captured_at);

console.log("First/current-touch attribution regression passed");
