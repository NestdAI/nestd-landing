import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
import { copy, APP_STORE } from "../content/marketing.mjs";
const pages = ["index.html", "pricing.html", "about.html", "download.html"];
test("marketing claims and every store destination reflect the paid-only verified funnel", () => {
  for (const lang of ["nl", "en"])
    for (const page of pages) {
      const html = fs.readFileSync(
        `${lang === "en" ? "en/" : ""}${page}`,
        "utf8",
      );
      assert.doesNotMatch(
        html,
        /AI[ -](?:matching|assistant|agent|woonassistent)|WhatsApp|Telegram|Android|unconfirmed public|duo|swip|19[,.]95|id6740091498|92%|testimonial|fastest|snelste|gratis downloaden|download gratis|start free/i,
      );
      assert.ok(html.includes(copy[lang].paid));
      assert.ok(html.includes(APP_STORE));
      assert.doesNotMatch(html, /href="#"|user-scalable=no|maximum-scale=1/);
      const schemas = [
        ...html.matchAll(
          /<script type="application\/ld\+json">(.*?)<\/script>/g,
        ),
      ].map((m) => JSON.parse(m[1]));
      for (const schema of schemas) {
        assert.equal(schema.inLanguage, lang);
        assert.ok(!schema.aggregateRating);
        assert.ok(!schema.offers);
      }
    }
});
test("all existing legal disclosures and dates are preserved in both languages", () => {
  const old = execFileSync("git", ["show", "f09f8ea:i18n.js"], {
    encoding: "utf8",
  }).split("const SUPPORTED_LANGUAGES")[0];
  const previous = vm.runInNewContext(old + "; translations");
  const legal = JSON.parse(fs.readFileSync("content/privacy.json"));
  for (const lang of ["nl", "en"]) {
    const html = fs.readFileSync(
      `${lang === "en" ? "en/" : ""}privacy.html`,
      "utf8",
    );
    for (const [key, value] of Object.entries(previous[lang]).filter(([k]) =>
      /^privacy(?:S[0-9]|Title|Date|Intro)/.test(k),
    )) {
      assert.equal(legal[lang][key], value, key);
      assert.ok(
        html.includes(value),
        `missing ${lang} legal disclosure: ${key}`,
      );
    }
  }
});
test("verification backend routing and universal-link association remain unchanged", () => {
  for (const path of [
    "vercel.json",
    ".well-known/apple-app-site-association",
    ".well-known/assetlinks.json",
  ])
    assert.equal(
      fs.readFileSync(path, "utf8"),
      execFileSync("git", ["show", `f09f8ea:${path}`], { encoding: "utf8" }),
    );
});
test("deep-link fallbacks never auto-redirect or expose listing IDs to marketing analytics", () => {
  const listing = fs.readFileSync("listing/index.html", "utf8");
  const app = fs.readFileSync("app/index.html", "utf8");
  assert.doesNotMatch(listing, /posthog|facebook|\/script.js/);
  assert.ok(app.includes(APP_STORE));
  const js = fs.readFileSync("deeplink.js", "utf8");
  assert.doesNotMatch(js, /location\.(href|replace|assign)\s*[=(]/);
});
