import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const APP = "https://apps.apple.com/nl/app/nestd/id6761392857";
const pages = [
  "index.html",
  "about.html",
  "pricing.html",
  "en/index.html",
  "en/about.html",
  "en/pricing.html",
];
for (const page of pages) {
  const html = read(page);
  assert.equal((html.match(/<h1>/g) || []).length, 1, page + " has one h1");
  assert.ok(html.includes(APP), page + " has correct App Store destination");
  assert.ok(
    html.includes('href="/assets/site.css"'),
    page + " uses fresh shared design",
  );
  assert.doesNotMatch(
    html,
    /WhatsApp|Telegram|Duo Zoeken|AI-matching|Google Play|6740091498|€0|92%|testimonials/i,
    page + " does not advertise obsolete/unverified features",
  );
  assert.match(html, /<link rel="canonical"/);
  assert.match(html, /<link rel="alternate" hreflang="en"/);
  assert.match(html, /data-cta-placement=/);
  assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);
  assert.ok(
    html.indexOf("localStorage.getItem('nestd-theme')") <
      html.indexOf("/assets/site.css"),
    "theme runs before stylesheet",
  );
  assert.match(html, /€19[,.]99/);
  assert.match(
    html,
    /Eerste week gratis|First week free|eerste gratis week|first free week/,
  );
  assert.doesNotMatch(html, /snelste|meeste platforms|fastest|most platforms/i);
}
assert.ok(
  read("about.html").includes("Een realistische missie."),
  "About explains an honest mission",
);
assert.ok(
  (read("about.html").match(/<article>/g) || []).length >= 6,
  "About has story chapters and principles",
);
const cfg = JSON.parse(read("vercel.json"));
assert.equal(cfg.outputDirectory, "dist");
for (const route of [
  "/listing/:id",
  "/app",
  "/verified",
  "/verify-error",
  "/verify",
])
  assert.ok(
    cfg.rewrites.some((r) => r.source === route),
    "preserved route " + route,
  );
for (const file of [
  ".well-known/apple-app-site-association",
  "app/index.html",
  "listing/index.html",
  "verified/index.html",
  "verify-error/index.html",
])
  assert.ok(fs.existsSync(path.join(root, "dist", file)), "packaged " + file);
console.log(
  "Static marketing, bilingual SEO, safe claims, canonical store links and preserved build routes passed.",
);
