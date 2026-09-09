import fs from "node:fs";
import path from "node:path";
import { previewProof } from "./preview-proof.mjs";
import { content } from "./content.mjs";
import { privacyContent } from "./privacy-content.mjs";
const root = path.resolve(import.meta.dirname, "..");
const APP = "https://apps.apple.com/nl/app/nestd/id6761392857";
const arrow = '<svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const lineIcons = {
  arrow: '<path d="M5 19 19 5M5 5h14v14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  home: '<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  portrait: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
};
const icon = (name) => `<svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true">${lineIcons[name]}</svg>`;
const apple =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.1 12.4c0-2 1.6-3 1.7-3.1-1-1.4-2.4-1.6-3-1.6-1.3-.1-2.5.8-3.2.8-.6 0-1.6-.8-2.7-.8-1.4 0-2.7.8-3.4 2-1.5 2.5-.4 6.3 1 8.3.7 1 1.4 2 2.5 1.9 1 0 1.4-.6 2.7-.6s1.6.6 2.7.6c1.1 0 1.8-1 2.4-1.9.8-1.1 1.1-2.2 1.1-2.3-.1 0-1.8-.7-1.8-3.3ZM15 6.4c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.6 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.6-1.2Z"/></svg>';
const url = (l, p = "") => (l === "en" ? "/en/" : "/") + p;
function cta(c, placement = "body") {
  return `<a class="download" href="${APP}" data-cta-placement="${placement}" target="_blank" rel="noopener">${apple}<span>${c.appstore}</span>${arrow}</a>`;
}
const themeIcons = {
  system:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>',
  light:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>',
  dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/></svg>',
};
function header(c, l, p) {
  const other = l === "nl" ? "en" : "nl";
  return `<a class="skip" href="#main">${c.skip}</a><header class="site-header"><div class="wrap header-inner"><a class="brand" href="${url(l)}" aria-label="Nestd ${c.home}"><img src="/logo.png" width="43" height="43" alt=""><span>nestd<span class="brand-dot">.</span></span></a><nav class="desktop-nav" aria-label="${c.menu}"><a href="${url(l)}#how">${c.how}</a><a href="${url(l, "about.html")}" ${p === "about.html" ? 'aria-current="page"' : ""}>${c.about}</a><a href="${url(l, "pricing.html")}" ${p === "pricing.html" ? 'aria-current="page"' : ""}>${c.pricing}</a></nav><div class="header-actions"><a class="language" data-language href="${url(other, p)}" aria-label="${c.language}">${other.toUpperCase()}</a><fieldset class="theme-switch" hidden><legend class="sr-only">${c.theme}</legend>${[
    ["system", c.system],
    ["light", c.light],
    ["dark", c.dark],
  ]
    .map(
      ([value, label]) =>
        `<label title="${label}"><input class="sr-only" type="radio" name="theme" value="${value}" aria-label="${label}"><span aria-hidden="true">${themeIcons[value]}</span></label>`,
    )
    .join(
      "",
    )}</fieldset><noscript><span class="theme-fallback">${c.system}</span></noscript><a class="nav-download" href="${APP}" data-cta-placement="nav" target="_blank" rel="noopener">${c.download} ${arrow}</a></div></div><nav class="mobile-nav wrap" aria-label="${c.menu}"><a href="${url(l)}#how">${c.how}</a><a href="${url(l, "about.html")}">${c.about}</a><a href="${url(l, "pricing.html")}">${c.pricing}</a></nav></header>`;
}
function closing(c) {
  return `<section class="closing"><div class="wrap closing-inner"><div><p class="eyebrow">${c.closingLabel}</p><h2>${c.closing}</h2></div><div class="closing-action"><p>${c.closingNote}</p>${cta(c, "closing")}<small>${c.iphone}</small></div></div></section>`;
}
function footer(c, l) {
  return `<footer class="wrap site-footer"><div class="footer-top"><a class="brand" href="${url(l)}"><img src="/logo.png" width="43" height="43" alt=""><span>nestd.</span></a><p>${c.footerLine}</p><nav aria-label="Footer"><a href="${url(l, "about.html")}">${c.about}</a><a href="mailto:hello@nestd.nl">${c.contact} ${arrow}</a><a href="${url(l, "privacy.html")}">${c.privacy}</a></nav></div><div class="footer-bottom"><span>© ${new Date().getUTCFullYear()} Nestd. ${c.copyright}</span><span>Made for finding home.</span></div></footer>`;
}
function faq(c) {
  return `<section class="wrap faq" id="faq"><div><p class="eyebrow">${c.faqLabel}</p><h2>${c.faqTitle}</h2></div><div class="faq-items">${c.faqs.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join("")}</div></section>`;
}
function offer(c) {
  return `<div class="offer-summary"><span class="trial-pill">${c.trial}</span><p><strong>${c.amount}</strong> <span>${c.period}</span></p></div>`;
}
function reach(c) {
  return `<section class="wrap section reach" id="speed"><div class="section-heading"><p class="eyebrow">${c.speedLabel}</p><h2>${c.speedTitle}</h2><p class="lead">${c.speedIntro}</p></div><div class="reach-cards">${c.speedCards.map(([h, p], i) => `<article><span class="reach-icon" aria-hidden="true">${icon(["search", "pin", "bell"][i])}</span><h3>${h}</h3><p>${p}</p></article>`).join("")}</div><div class="source-band"><p class="eyebrow">${c.sourceLabel}</p><ul aria-label="${c.sourceLabel}">${["Funda", "Pararius", "Kamernet", "Vesteda", "123Wonen", "Rotsvast"].map((x) => `<li>${x}</li>`).join("")}</ul><p class="caption">${c.sourceNote}</p></div><p class="caption speed-note">${c.speedNote}</p></section>`;
}
function experiences(c) {
  return `<section class="experiences"><div class="wrap experiences-inner"><div><p class="eyebrow">${c.reviewLabel}</p><h2>${c.reviewTitle}</h2></div><div><p class="lead">${c.reviewIntro}</p><a class="text-link" href="mailto:hello@nestd.nl?subject=Nestd%20ervaring">${c.reviewCta} ${arrow}</a><a class="review-store" href="${APP}" target="_blank" rel="noopener">${c.reviewStore} ${arrow}</a><p class="caption">${c.reviewNote}</p></div></div></section>`;
}
function proofPlaceholders(l) {
  // Vercel production must never include design-only proof. Local/preview are reviewable.
  if (process.env.VERCEL_ENV === "production" || process.env.NESTD_HIDE_PROOF_PREVIEW === "1") return "";
  const en = l === "en";
  const label = en ? "FICTIONAL PLACEHOLDER" : "FICTIEVE PLACEHOLDER";
  return `<section class="wrap section proof-preview" data-proof-preview aria-label="${en ? 'Design placeholders' : 'Ontwerp-placeholders'}">
    <p class="proof-notice">${en ? 'DESIGN PREVIEW · All figures, timings and reviews below are fictional. Replace with verified data before publication.' : 'ONTWERPPREVIEW · Alle onderstaande cijfers, tijden en reviews zijn fictief. Vervang ze vóór publicatie door geverifieerde gegevens.'}</p>
    <div class="proof-metrics"><article><span class="proof-label">${label}</span><h2>${en ? 'A search shared by many.' : 'Samen op zoek naar thuis.'}</h2><strong class="proof-number">${previewProof.activeUsers}</strong><p>${en ? 'active users — example figure, not a current count' : 'actieve gebruikers — voorbeeldcijfer, geen actueel aantal'}</p></article>
    <article class="timing-card"><span class="proof-label">${label}</span><h2>${en ? 'From listing to notification.' : 'Van aanbod naar melding.'}</h2><p>${en ? 'One shared timeline. Example timings to design the comparison, not measured results.' : 'Eén gezamenlijke tijdlijn. Voorbeeldtijden voor de vormgeving, geen gemeten resultaten.'}</p><dl class="proof-timings">${previewProof.timings.map(([name,time],i) => `<div><dt>${name}</dt><dd>${time}<small>${en ? 'fictional' : 'fictief'}</small></dd><span class="timing-track" aria-hidden="true"><span style="width:${Math.max(4,previewProof.timingSeconds[i]/Math.max(...previewProof.timingSeconds)*100)}%"></span></span></div>`).join('')}</dl><p class="timing-method">${en ? 'To add: source publication → device receipt · same listings · median and 95th percentile · dates and sample size.' : 'Nog invullen: bronpublicatie → ontvangst op toestel · dezelfde woningen · mediaan en 95e percentiel · meetperiode en steekproef.'}</p></article></div>
    <div class="review-heading"><div><p class="eyebrow">${en ? 'Experiences with Nestd' : 'Ervaringen met Nestd'}</p><h2 id="review-heading">${en ? 'A new home. A personal story.' : 'Een nieuwe plek. Een eigen verhaal.'}</h2><p>${en ? 'Example stories — replace these cards with approved customer reviews and portraits.' : 'Voorbeeldverhalen — vervang deze kaarten door goedgekeurde klantreviews en portretten.'}</p></div></div>
    <div class="review-carousel" data-review-carousel role="region" aria-roledescription="${en ? 'carousel' : 'carrousel'}" aria-labelledby="review-heading">
      <div class="proof-reviews" id="review-track" tabindex="0" aria-label="${en ? 'Example reviews, scroll to explore' : 'Voorbeeldreviews, scroll om te bladeren'}">${previewProof.reviews[l].map(([name,quote],i) => `<figure data-review-slide role="group" aria-roledescription="${en ? 'slide' : 'dia'}" aria-label="${i+1} ${en ? 'of' : 'van'} ${previewProof.reviews[l].length}"><span class="proof-label">${label}</span><div class="review-person">${previewProof.portraits[i]?.src ? `<img class="review-portrait" src="${previewProof.portraits[i].src}" alt="${previewProof.portraits[i].alt}" width="88" height="88" loading="lazy">` : `<div class="portrait-placeholder" role="img" aria-label="${en ? 'Portrait placeholder' : 'Portret-placeholder'} ${i+1}">${icon("portrait")}<span>${en ? 'Photo' : 'Foto'} 0${i+1}</span></div>`}<figcaption><strong>${name}</strong><span>${en ? 'City · search context' : 'Stad · zoeksituatie'}</span></figcaption></div><blockquote>“${quote}”</blockquote><p class="portrait-brief">${en ? 'Portrait to add · square · min. 600 × 600 px' : 'Portret toevoegen · vierkant · min. 600 × 600 px'}</p><p class="caption">${en ? 'Example copy — not a real customer review.' : 'Voorbeeldtekst — geen echte gebruikersreview.'}</p></figure>`).join('')}</div>
      <div class="review-controls" hidden><div class="review-buttons"><button type="button" data-review-prev aria-controls="review-track" aria-label="${en ? 'Previous review' : 'Vorige review'}"><svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><button type="button" data-review-next aria-controls="review-track" aria-label="${en ? 'Next review' : 'Volgende review'}"><svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></div><span data-review-status aria-live="polite" aria-atomic="true">1 / ${previewProof.reviews[l].length}</span><div class="review-dots">${previewProof.reviews[l].map((_,i)=>`<button type="button" data-review-index="${i}" aria-label="${en ? 'Go to example review' : 'Ga naar voorbeeldreview'} ${i+1}" aria-controls="review-track" ${i===0?'aria-current="true"':''}><span></span></button>`).join('')}</div></div>
    </div>
  </section>`;
}
function homeOffer(c) {
  return `<section class="wrap home-offer"><div><p class="eyebrow">${c.priceEyebrow}</p><h2>${c.offerTitle}</h2><p class="lead">${c.offerIntro}</p></div><div>${offer(c)}${cta(c, "home-offer")}<p class="caption">${c.priceNote}</p></div></section>`;
}
function phones(c, l) {
  const en = l === "en";
  return `<figure class="hero-art device-showcase"><div class="device-halo" aria-hidden="true"></div><div class="device-stage"><div class="device device-back" aria-hidden="true"><div class="device-screen lock-screen"><img class="lock-wallpaper" src="/assets/amsterdam.jpg" width="1400" height="933" alt="" fetchpriority="high"><div class="island"></div><div class="lock-time"><span>${en ? "Your next chapter" : "Jouw volgende hoofdstuk"}</span><strong>09:41</strong></div><div class="lock-alert"><img src="/logo.png" width="32" height="32" alt=""><div><span>NESTD</span><strong>${en ? "A home worth opening." : "Een woning om te openen."}</strong><p>${en ? "New rental matching your search." : "Nieuw aanbod dat past bij jouw wensen."}</p></div></div><span class="home-indicator"></span></div></div><div class="device device-front"><div class="device-screen"><img src="/assets/app-source-selection.png" width="942" height="2048" alt="${en ? "Nestd app preview: choose rental websites including Vesteda, Pararius and Funda. Dutch interface." : "Nestd app-preview: kies woningwebsites zoals Vesteda, Pararius en Funda."}" fetchpriority="high"></div></div><div class="device-chip" aria-hidden="true">${arrow}${en ? "Your search. Always within reach." : "Jouw zoektocht. Altijd bij de hand."}</div></div><figcaption>${en ? "Source selection: screenshot of the new app preview. Alert: illustration." : "Bronselectie: screenshot van de nieuwe app-preview. Melding: illustratie."}</figcaption><button class="motion-control" type="button" aria-pressed="false" hidden data-pause-label="${en ? "Pause animation" : "Animatie pauzeren"}" data-play-label="${en ? "Play animation" : "Animatie afspelen"}">${en ? "Pause animation" : "Animatie pauzeren"}</button></figure>`;
}
function home(c, l) {
  return `<section class="wrap hero"><div class="hero-copy"><p class="eyebrow">${c.eyebrow}</p><h1>${c.hero}</h1><p class="lead">${c.intro}</p><div class="hero-cta">${cta(c, "hero")}<small>${c.iphone}</small></div><a class="text-link" href="#how">${c.heroLink} <svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m-7-7 7 7 7-7"/></svg></a></div>${phones(c, l)}</section><div class="criteria-strip"><div class="wrap">${c.strip.map((s, i) => `<span>${s}</span>${i < 3 ? '<b class="criteria-divider" aria-hidden="true"></b>' : ""}`).join("")}</div></div>
<section class="wrap journey section" id="how"><div class="section-heading"><p class="eyebrow">${c.journeyLabel}</p><h2>${c.journeyTitle}</h2><p class="lead">${c.journeyIntro}</p></div><ol class="steps">${c.steps.map(([h, p], i) => `<li><span class="step-number">0${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join("")}</ol></section>
<section class="focus-section"><div class="wrap focus-inner"><div class="search-illustration"><div class="drawing-title">${icon("home")} ${l === "nl" ? "Mijn volgende plek" : "My next place"}</div><dl>${c.filters.map((f, i) => `<div><dt>${f}</dt><dd>${c.sample[i]}${icon(i === 0 ? "pin" : "check")}</dd></div>`).join("")}</dl><p>${c.sampleLabel}</p></div><div class="focus-copy"><p class="eyebrow">${c.focusLabel}</p><h2>${c.focusTitle}</h2><p class="lead">${c.focusIntro}</p><p class="focus-note">${c.focusNote}</p></div></div></section>
${reach(c)}<section class="wrap story-teaser section"><p class="eyebrow">${c.storyLabel}</p><div class="story-teaser-inner"><h2>${c.storyTitle}</h2><div><p class="lead">${c.storyIntro}</p><a class="text-link" href="${url(l, "about.html")}">${c.storyLink} ${arrow}</a></div></div></section>${proofPlaceholders(l) || experiences(c)}${homeOffer(c)}${faq(c)}${closing(c)}`;
}
function about(c, l) {
  return `<section class="wrap about-hero"><p class="eyebrow">${c.aboutEyebrow}</p><h1>${c.aboutTitle}</h1><p class="lead">${c.aboutLead}</p></section><figure class="about-photo wrap"><img src="/assets/amsterdam.jpg" alt="${l === "nl" ? "Woningen langs een Amsterdamse gracht" : "Homes along an Amsterdam canal"}" width="1400" height="933"><figcaption>${c.aboutPhoto}</figcaption></figure><section class="wrap story-body">${c.aboutSections.map(([h, a, b], i) => `<article><div class="story-index">0${i + 1} <span aria-hidden="true">/</span> NESTD</div><div><h2>${h}</h2><p>${a}</p><p>${b}</p></div></article>`).join("")}</section><section class="principles"><div class="wrap"><p class="eyebrow">Nestd, ${l === "nl" ? "in drie gedachten" : "in three thoughts"}</p><h2>${c.principlesTitle}</h2><div class="principles-grid">${c.principles.map(([h, p], i) => `<article><span class="principle-symbol" aria-hidden="true">${icon(["arrow", "search", "home"][i])}</span><h3>${h}</h3><p>${p}</p></article>`).join("")}</div></div></section><section class="wrap contact section" id="contact"><div><p class="eyebrow">${c.contact}</p><h2>${c.contactTitle}</h2></div><div><p class="lead">${c.contactText}</p><a class="contact-mail" href="mailto:hello@nestd.nl">hello@nestd.nl ${arrow}</a></div></section>${closing(c)}`;
}
function pricing(c) {
  return `<section class="wrap price-hero"><div><p class="eyebrow">${c.priceEyebrow}</p><h1>${c.priceTitle}</h1><p class="lead">${c.priceIntro}</p></div><div class="subscription"><div class="subscription-top"><img src="/logo.png" width="64" height="64" alt=""><span>Nestd</span>${arrow}</div>${offer(c)}<ul>${c.priceFeatures.map((f) => `<li>${icon("check")}${f}</li>`).join("")}</ul>${cta(c, "subscription")}<p>${c.priceNote}</p></div></section><section class="wrap price-detail"><p class="eyebrow">${c.priceDetail}</p><h2>${c.priceValue}</h2></section>${faq(c)}${closing(c)}`;
}
function privacy(c, l) {
  const t = privacyContent[l];
  return `<article class="wrap legal-page"><p class="eyebrow">Nestd</p><h1>${t.privacyTitle}</h1><p class="legal-date">${t.privacyDate}</p><p>${t.privacyIntro}</p>${[
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]
    .map(
      (n) =>
        `<section><h2>${t["privacyS" + n + "Title"]}</h2>${Object.entries(t)
          .filter(
            ([k]) =>
              k.startsWith("privacyS" + n) &&
              !k.endsWith("Title") &&
              !(n === 1 && k.startsWith("privacyS10")),
          )
          .map(([k, v]) => `<p>${v}</p>`)
          .join("")}</section>`,
    )
    .join("")}</article>`;
}
const themeBoot = `try{var t=localStorage.getItem('nestd-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
for (const [l, c] of Object.entries(content)) {
  for (const [p, body, title, description] of [
    [
      "",
      home(c, l),
      l === "nl"
        ? "Nestd — Stop met refreshen. Begin met leven."
        : "Nestd — Stop refreshing. Start living.",
      c.intro,
    ],
    ["about.html", about(c, l), c.about + " — Nestd", c.aboutLead],
    ["pricing.html", pricing(c), c.pricing + " — Nestd", c.priceIntro],
    [
      "privacy.html",
      privacy(c, l),
      c.privacy + " — Nestd",
      privacyContent[l].privacyIntro,
    ],
  ]) {
    const html = `<!doctype html>\n<html lang="${l}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><title>${title}</title><meta name="description" content="${description}"><meta name="posthog-key" content="phc_uardbxGnhavwrDMNskL74udz6Z5NjCMrXsWYgGDK9VuS"><link rel="canonical" href="https://www.nestd.nl${url(l, p)}"><link rel="alternate" hreflang="nl" href="https://www.nestd.nl${url("nl", p)}"><link rel="alternate" hreflang="en" href="https://www.nestd.nl${url("en", p)}"><link rel="alternate" hreflang="x-default" href="https://www.nestd.nl${url("nl", p)}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="https://www.nestd.nl/assets/amsterdam.jpg"><meta property="og:type" content="website"><meta property="og:url" content="https://www.nestd.nl${url(l, p)}"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="preload" href="/assets/manrope.ttf" as="font" type="font/ttf" crossorigin><script>${themeBoot}</script><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script><script src="/assets/analytics.js" defer></script></head><body>${header(c, l, p)}<main id="main">${body}</main>${footer(c, l)}</body></html>\n`;
    const out = path.join(root, l === "en" ? "en" : "", p || "index.html");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html.replace(/></g, ">\n<"));
  }
}
// Explicit static output: Vercel's project default public/ must not select stale output.
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const item of [
  "index.html",
  "about.html",
  "pricing.html",
  "privacy.html",
  "features.html",
  "admin.html",
  "en",
  "app",
  "listing",
  "verified",
  "verify-error",
  ".well-known",
  "assets",
  "images",
  "logo.png",
  "favicon.ico",
  "apple-touch-icon.png",
  "styles.css",
  "pages.css",
  "script.js",
  "i18n.js",
])
  fs.cpSync(path.join(root, item), path.join(dist, item), { recursive: true });
console.log(
  "Built bilingual marketing pages and preserved legacy/verification routes into dist/.",
);
