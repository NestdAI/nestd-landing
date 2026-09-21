import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../product-motion.js", import.meta.url),
  "utf8",
);

function environment(options = {}) {
  const animations = [];
  const observers = [];
  const preferenceListeners = [];
  const clicks = [];
  const preference = {
    matches: options.reduced || false,
    addEventListener: (_event, listener) => preferenceListeners.push(listener),
  };
  const replay = {
    hidden: true,
    addEventListener: (_event, listener) => clicks.push(listener),
  };
  const visual = {
    style: { transform: "rotate(-3deg)" },
    textContent: "Nieuwe huurwoning in Utrecht",
  };
  if (!options.noAnimation)
    visual.animate = (frames, settings) => {
      if (options.animationThrows) throw new Error("animation unavailable");
      const animation = {
        frames,
        settings,
        canceled: false,
        onfinish: null,
        cancel() {
          this.canceled = true;
        },
        finish() {
          this.onfinish?.();
        },
      };
      animations.push(animation);
      return animation;
    };
  const demo = {
    querySelector: (selector) =>
      selector === "[data-alert-visual]" ? visual : replay,
  };
  const window = {
    CSS: { supports: () => !options.noTranslate },
    matchMedia: () => preference,
    getComputedStyle: () => ({ translate: "0px 7px", opacity: "0.72" }),
  };
  if (!options.noObserver)
    window.IntersectionObserver = class {
      constructor(callback, settings) {
        if (options.observerThrows) throw new Error("observer unavailable");
        this.callback = callback;
        this.settings = settings;
        this.disconnected = false;
        observers.push(this);
      }
      observe(target) {
        this.target = target;
      }
      disconnect() {
        this.disconnected = true;
      }
      intersect(ratio, target = visual) {
        this.callback([
          { target, intersectionRatio: ratio, isIntersecting: ratio > 0 },
        ]);
      }
    };
  if (options.noMatchMedia) delete window.matchMedia;
  if (options.noCSS) delete window.CSS;
  if (options.legacyPreference) {
    delete preference.addEventListener;
    preference.addListener = (listener) => preferenceListeners.push(listener);
  }
  if (options.noPreferenceListener) delete preference.addEventListener;
  const context = vm.createContext({
    window,
    document: { querySelectorAll: () => [demo] },
  });
  vm.runInContext(source, context);
  return {
    animations,
    observers,
    visual,
    replay,
    click: () => clicks.forEach((listener) => listener()),
    reduce(value) {
      preference.matches = value;
      preferenceListeners.forEach((listener) => listener({ matches: value }));
    },
  };
}

test("the notification remains readable and arrives only on its first meaningful viewport entry", () => {
  const page = environment();
  assert.equal(page.visual.textContent, "Nieuwe huurwoning in Utrecht");
  assert.equal(page.replay.hidden, false);
  assert.equal(page.animations.length, 0);
  page.observers[0].intersect(0.1);
  page.observers[0].intersect(0.8, {});
  assert.equal(page.animations.length, 0);
  page.observers[0].intersect(0.15);
  assert.equal(page.animations.length, 1);
  assert.equal(page.observers[0].disconnected, true);
  page.animations[0].finish();
  page.observers[0].intersect(0.9);
  assert.equal(page.animations.length, 1);
  assert.equal(page.visual.style.transform, "rotate(-3deg)");
  assert.equal(
    page.animations[0].frames.some((frame) => "transform" in frame),
    false,
  );
});

test("replay restarts a settled notification and repeated taps interrupt from its visible position", () => {
  const page = environment();
  page.click();
  assert.equal(page.observers[0].disconnected, true);
  page.observers[0].intersect(1);
  assert.equal(page.animations.length, 1);
  page.click();
  assert.equal(page.animations[0].canceled, true);
  assert.equal(page.animations[1].frames[0].translate, "0px 7px");
  assert.equal(page.animations[1].frames[0].opacity, "0.72");
  // A stale finish callback cannot clear the newer animation.
  page.animations[0].finish();
  page.click();
  assert.equal(page.animations[1].canceled, true);
  page.animations[2].finish();
  page.click();
  assert.equal(page.animations[3].frames[0].translate, "0 18px");
  assert.equal(page.animations[3].frames.at(-1).opacity, 1);
});

test("reduced motion starts static and returning to full motion never autoplays unexpectedly", () => {
  const page = environment({ reduced: true });
  assert.equal(page.replay.hidden, true);
  assert.equal(page.observers.length, 0);
  page.click();
  assert.equal(page.animations.length, 0);
  page.reduce(false);
  assert.equal(page.replay.hidden, false);
  assert.equal(page.animations.length, 0);
  page.click();
  assert.equal(page.animations.length, 1);
});

test("enabling reduced motion cancels the running demo and suppresses queued viewport entries", () => {
  const page = environment();
  page.observers[0].intersect(1);
  page.reduce(true);
  assert.equal(page.animations[0].canceled, true);
  assert.equal(page.replay.hidden, true);
  assert.equal(page.visual.style.transform, "rotate(-3deg)");
  page.observers[0].intersect(1);
  page.click();
  assert.equal(page.animations.length, 1);
  page.reduce(false);
  assert.equal(page.animations.length, 1);
  page.click();
  assert.equal(page.animations.length, 2);
});

test("older media preference listeners also cancel motion when preferences change", () => {
  const page = environment({ legacyPreference: true });
  page.click();
  page.reduce(true);
  assert.equal(page.animations[0].canceled, true);
  assert.equal(page.replay.hidden, true);
});

test("without viewport observation, the illustration stays static until explicit replay", () => {
  for (const options of [{ noObserver: true }, { observerThrows: true }]) {
    const page = environment(options);
    assert.equal(page.animations.length, 0);
    assert.equal(page.replay.hidden, false);
    page.click();
    assert.equal(page.animations.length, 1);
  }
});

test("missing motion APIs retain readable content and do not expose a broken replay control", () => {
  for (const options of [
    { noAnimation: true },
    { noTranslate: true },
    { noCSS: true },
    { noMatchMedia: true },
    { noPreferenceListener: true },
  ]) {
    const page = environment(options);
    assert.equal(page.replay.hidden, true);
    assert.equal(page.animations.length, 0);
    assert.equal(page.visual.textContent, "Nieuwe huurwoning in Utrecht");
    assert.equal(page.visual.style.transform, "rotate(-3deg)");
  }
});

test("an animation failure removes its control without hiding or changing the notification", () => {
  const page = environment({ animationThrows: true });
  page.click();
  assert.equal(page.replay.hidden, true);
  page.reduce(true);
  page.reduce(false);
  assert.equal(page.replay.hidden, true);
  assert.equal(page.visual.textContent, "Nieuwe huurwoning in Utrecht");
  assert.equal(page.visual.style.transform, "rotate(-3deg)");
});
