import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const store = "https://apps.apple.com/nl/app/nestd/id6761392857";
for (const page of ["index.html", "about.html", "pricing.html"]) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  const copy = html.replace(
    /<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi,
    "",
  );
  assert.doesNotMatch(
    copy,
    /\bAI\b|chatbot|swip(?:e|en|ing)?|duo\s+(?:zoeken|search)|auto[- ]?(?:react|apply)|wachtlijst|waitlist|pre-launch|eerste 100|first 100|meest gekozen|most popular|most chosen|\d+%\s*match/i,
    `${page}: removed product claims`,
  );
  assert.doesNotMatch(
    copy,
    /snelste|fastest|binnen \d+ seconden|within \d+ seconds|\d+\+\s*(?:websites|huurwebsites)/i,
    `${page}: unsupported proof`,
  );
  assert.doesNotMatch(
    copy,
    /\bgratis\b|\bfree\b|€\s?0\b|€\s?19[,.](?:95|99)|free-title|plan-columns|class="plans"/i,
    `${page}: superseded free tier or old subscription price`,
  );
  assert.doesNotMatch(
    copy,
    /WhatsApp|wa\.me/i,
    `${page}: superseded alert channel`,
  );
  assert.match(copy, /Telegram/, `${page}: current alert channel`);
  assert.match(copy, /€14,99 per maand/, `${page}: Dutch monthly Pro price`);
  assert.doesNotMatch(
    copy,
    /€\s?15\b/,
    `${page}: superseded monthly Pro price`,
  );
  assert.match(copy, /€14\.99 per month/, `${page}: English monthly Pro price`);
  if (page === "index.html") {
    assert.doesNotMatch(html, /data-review-placeholder|\[Naam\]|\[Name\]|"(?:aggregateRating|reviewRating)"/, "No placeholder or fabricated reviews");
    assert.match(html, /id="meldingen"/, "Complete alert explanation");
    const replay = html.match(/<button\b[^>]*data-alert-replay[^>]*>/)?.[0];
    assert.ok(replay, "Product demonstration has an accessible replay control");
    assert.match(
      replay,
      /\bhidden\b/,
      "No broken replay when JavaScript is unavailable",
    );
    assert.match(replay, /data-aria-nl="Speel melding af"/);
    assert.match(replay, /data-aria-en="Replay alert"/);
    assert.match(html, /src="\/product-motion.js" defer/);
  }
  assert.doesNotMatch(
    html,
    /user-scalable=no|maximum-scale=1|facebook\.com\/tr/i,
    `${page}: privacy/accessibility regression`,
  );
  if (page === "about.html") {
    const forms = [...html.matchAll(/<form\b[^>]*>/g)];
    assert.equal(forms.length, 1, "Only the existing contact form is allowed");
    assert.match(forms[0][0], /id="contact-form"/);
    assert.match(forms[0][0], /method="post"/);
    assert.match(
      forms[0][0],
      /\bhidden\b/,
      "No native submission without the contact script",
    );
    assert.match(
      html,
      /src="\/contact.js"/,
      "Contact form enhancement is loaded",
    );
    assert.match(
      html,
      /mailto:hello@nestd.nl/,
      "Email fallback remains available",
    );
    const fields = [
      ...html.matchAll(/<(?:input|textarea)\b[^>]*\bname="([^"]+)"[^>]*>/g),
    ];
    assert.deepEqual(fields.map(([, name]) => name).sort(), [
      "email",
      "message",
      "name",
    ]);
    for (const [field] of fields) {
      assert.match(field, /\brequired\b/);
      assert.match(field, /\bmaxlength="\d+"/);
    }
  } else {
    assert.doesNotMatch(
      html,
      /<form\b|<input\b|<textarea\b/i,
      `${page}: no waitlist or search preference collection`,
    );
  }
  assert.match(html, /id="lang-toggle"/, `${page}: language control`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${page}: duplicate IDs`);
  const ctas = [...html.matchAll(/<a\b[^>]*data-cta-placement="[^"]+"[^>]*>/g)];
  assert.ok(ctas.length, `${page}: download CTA`);
  for (const [tag] of ctas) {
    assert.ok(
      tag.includes(`href="${store}"`),
      `${page}: verified native App Store link`,
    );
    assert.match(tag, /rel="[^"]*noopener/, `${page}: safe new tab`);
  }
  for (const [tag] of html.matchAll(/<[^!][^>]*\bdata-nl="[^"]*"[^>]*>/g)) {
    assert.match(
      tag,
      /data-en="[^"]+"/,
      `${page}: missing English translation`,
    );
  }
  for (const [, href] of html.matchAll(/href="#([^"]*)"/g)) {
    assert.ok(
      href && ids.includes(href),
      `${page}: broken local anchor #${href}`,
    );
  }
  for (const [, resource] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(resource) || resource === "/")
      continue;
    const local = path.resolve(
      root,
      resource.replace(/^\//, "").split(/[?#]/)[0],
    );
    assert.ok(fs.existsSync(local), `${page}: missing resource ${resource}`);
    if (resource.includes("#") && local.endsWith(".html")) {
      const anchor = resource.split("#")[1];
      assert.ok(
        fs.readFileSync(local, "utf8").includes(`id="${anchor}"`),
        `${page}: missing destination anchor ${resource}`,
      );
    }
  }
  assert.match(
    html,
    /href="\/?pricing\.html"/,
    `${page}: pricing remains discoverable`,
  );
  assert.match(
    html,
    /href="\/?about\.html"/,
    `${page}: about remains discoverable`,
  );
  if (page === "index.html" || page === "pricing.html") {
    const plans = [
      ...html.matchAll(/data-plan-price="pro"[^>]*>\s*€14,99\s*<\/span\s*>/g),
    ];
    assert.equal(plans.length, 1, `${page}: exactly one Pro plan at €14,99`);
    assert.match(
      copy,
      /(?:Alle|alle) (?:genoemde )?functies zijn inbegrepen|Alle functies in één abonnement/,
      `${page}: all features included`,
    );
    assert.match(
      html,
      /data-plan-price="pro"\s+data-nl="€14,99"\s+data-en="€14\.99"/,
      `${page}: localized Pro amount`,
    );
    assert.match(copy, /Telegram/, `${page}: concrete Pro channel`);
    assert.match(copy, /[Pp]ush/, `${page}: included push channel`);
  }
}
for (const page of [
  "app/index.html",
  "listing/index.html",
  "verified/index.html",
]) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  assert.doesNotMatch(
    html,
    /id6740091498|AI-powered|chat with AI/i,
    `${page}: stale download fallback`,
  );
}
const privacy = fs.readFileSync(path.join(root, "privacy.html"), "utf8");
assert.match(privacy, /Notificaties — om je via push en Telegram/);
assert.match(privacy, /Notifications — to inform you by push and Telegram/);
assert.doesNotMatch(
  privacy,
  /via WhatsApp op de hoogte|via WhatsApp about new homes/,
);
console.log("Static alerts landing contract passed");
