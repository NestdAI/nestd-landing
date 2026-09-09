import fs from "node:fs";
import { copy, APP_STORE } from "../content/marketing.mjs";
import QRCode from "qrcode";
import { aboutCopy } from "../content/about.mjs";
import { storefront } from "../content/storefront.mjs";
import { conversion } from "../content/conversion.mjs";
import { demo, clarity, nextSteps } from "./conversion.mjs";
import { phones, trust, icon } from "./storefront.mjs";
const privacy = JSON.parse(
  fs.readFileSync(new URL("../content/privacy.json", import.meta.url)),
);
const root = new URL("../", import.meta.url);
const write = (file, body) => {
  fs.mkdirSync(new URL("./" + file.split("/").slice(0, -1).join("/"), root), {
    recursive: true,
  });
  fs.writeFileSync(new URL(file, root), body);
};
const escape = (s) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
const paths = {
  home: "",
  pricing: "pricing.html",
  about: "about.html",
  download: "download.html",
  privacy: "privacy.html",
};
const pathFor = (lang, page) => `${lang === "en" ? "/en/" : "/"}${paths[page]}`;
const arrow = '<span aria-hidden="true">↗</span>';
function cta(t, placement, secondary = false) {
  return `<a class="button ${secondary ? "button-light" : ""}" href="${APP_STORE}" data-cta-placement="${placement}">${t.download} ${arrow}</a>`;
}
function priceCard(t, placement) {
  return `<div class="plan-card"><div class="plan-top"><span class="wordmark">${t.planName}<span class="brand-dot">.</span></span><span class="pill">${t.pricingLabel}</span></div><h3 class="price">${t.price}</h3><p class="period">${t.period}</p><ul class="included">${t.includes.map((v) => `<li><span aria-hidden="true">✓</span>${v}</li>`).join("")}</ul>${cta(t, placement)}<p class="fine-print">${t.priceNote}</p></div>`;
}
function faq(t, lang) {
  return `<section class="section faq" id="faq" data-section="faq"><div class="section-heading"><p class="eyebrow">${t.faqLabel}</p><h2>${t.faqTitle}</h2></div><div class="faq-list">${[...t.faqs.slice(0, 2), ...conversion[lang].extraFaqs, ...t.faqs.slice(2)].map(([q, a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join("")}</div></section>`;
}
function download(t, full = false) {
  return `<section class="download-band ${full ? "full-download" : ""}" id="download" data-section="download"><div class="download-copy"><p class="eyebrow">NESTD / IPHONE</p><${full ? "h1" : "h2"}>${t.downloadTitle}</${full ? "h1" : "h2"}><p>${t.downloadIntro}</p>${cta(t, "download")}<p class="paid-note">${t.paid}</p></div><div class="handoff"><img src="/images/download-qr.svg" alt="${t.scan}" width="156" height="156"><h3>${t.handoff}</h3><p>${t.scan}</p><a href="${APP_STORE}" data-cta-placement="qr_link">App Store ${arrow}</a></div></section>`;
}
function home(t, lang) {
  const s = storefront[lang];
  return `<section class="hero" data-section="hero"><div class="hero-copy"><p class="eyebrow hero-badge">${icon("home")}${s.badge}</p><h1>${s.hero}</h1><p class="hero-intro">${s.intro}</p><div class="hero-actions">${cta(t, "hero")}<a class="text-link" href="#how-it-works">${conversion[lang].demoLink} <span aria-hidden="true">↓</span></a></div><p class="paid-note">${t.paid}</p><div class="hero-trust">${s.trustStrip.map((v, i) => `<span>${icon(["home", "shield", "mail"][i])}${v}</span>`).join("")}</div></div>${phones(t, lang)}</section>${demo(lang)}${clarity(lang)}<section class="section pricing-section" id="pricing" data-section="pricing"><div><p class="eyebrow">${t.pricingLabel}</p><h2>${t.pricingTitle}</h2><p class="section-intro">${t.pricingIntro}</p><p class="fine-print">${t.noGuarantee}</p><a class="text-link" href="${pathFor(lang, "pricing")}">${t.priceLink} ${arrow}</a></div>${priceCard(t, "home_pricing")}</section>${trust(t, lang)}${faq(t, lang)}${download(t)}`;
}
function pricing(t, lang) {
  return `<section class="section pricing-section page-intro" data-section="pricing"><div><p class="eyebrow">${t.pricingLabel}</p><h1>${t.pricingTitle}</h1><p class="section-intro">${t.pricingIntro}</p><p class="terms-copy">${t.priceTerms}</p><p class="fine-print">${t.noGuarantee}</p></div>${priceCard(t, "pricing_page")}</section>${clarity(lang)}${faq(t, lang)}${download(t)}`;
}
function about(t, lang) {
  const a = aboutCopy[lang];
  return `<section class="about-intro" data-section="about_mission"><p class="eyebrow">${a.label}</p><h1>${a.title}</h1><div class="about-intro-bottom"><p>${a.intro}</p><div class="about-jump-links"><a class="text-link" href="#story">${a.storyLink} ↓</a><a class="text-link" href="#contact">${a.contactLink} ↗</a></div></div></section><figure class="about-photo"><img src="/images/search-home.webp" alt="${a.photo}" width="800" height="595" fetchpriority="high"><figcaption>${a.photoCaption}</figcaption></figure><section class="section about-story" id="story" data-section="about_story"><div><p class="eyebrow">${a.storyLabel}</p><h2>${a.storyTitle}</h2></div><div class="story-copy">${a.story.map((p) => `<p>${p}</p>`).join("")}</div></section><section class="mission-panel" data-section="about_principles"><p class="eyebrow">${a.missionLabel}</p><h2>${a.mission.replace("\n", "<br>")}</h2><p>${a.missionBody}</p></section><section class="section about-values"><div class="section-heading"><p class="eyebrow">${a.principlesLabel}</p><h2>${a.principlesTitle}</h2></div><div class="trust-grid">${a.principles.map(([title, body], i) => `<article>${icon(["filter", "home", "shield"][i])}<h3>${title}</h3><p>${body}</p></article>`).join("")}</div></section><section class="section about-audience"><p class="eyebrow">${a.audienceLabel}</p><h2>${a.audienceTitle}</h2><p>${a.audienceBody}</p></section><section class="section company-section" id="contact" data-section="about_contact"><div><p class="eyebrow">${a.contactLabel}</p><h2>${a.contactTitle}</h2><p class="section-intro">${a.contactBody}</p><a class="button" href="mailto:hello@nestd.nl">${a.contactAction} ${arrow}</a></div><div class="company-details"><div><span>${a.companyLabel}</span><strong>Muba B.V.</strong><a href="${APP_STORE}">Nestd · App Store ↗</a></div><div><span>${a.supportLabel}</span><a href="mailto:hello@nestd.nl">hello@nestd.nl ↗</a></div><div><span>${a.policyLabel}</span><p>${a.policyBody}</p><a href="${pathFor(lang, "privacy")}">${t.privacy} ↗</a><a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">${t.terms} ↗</a></div></div></section>${download(t)}`;
}
function privacyContent(t, lang) {
  const p = privacy[lang];
  return `<article class="section legal page-intro"><h1>${p.privacyTitle}</h1><p class="fine-print">${p.privacyDate}</p><p>${p.privacyIntro}</p>${[
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]
    .map((i) => {
      let prefix = `privacyS${i}`;
      return `<section><h2>${p[prefix + "Title"] || ""}</h2>${Object.entries(p)
        .filter(
          ([k]) =>
            new RegExp("^" + prefix + "[^0-9]").test(k) &&
            k !== prefix + "Title",
        )
        .map(([k, v]) => (k.match(/[a-d]$/) ? `<p>${v}</p>` : `<p>${v}</p>`))
        .join("")}</section>`;
    })
    .join("")}</article>`;
}
for (const [lang, t] of Object.entries(copy))
  for (const page of Object.keys(paths)) {
    const path = pathFor(lang, page),
      other = lang === "nl" ? "en" : "nl";
    const title =
      page === "home"
        ? t.title
        : `${t[page + "Page"] || t.privacy} | Nestd — ${lang === "nl" ? "Woningmeldingen" : "Rental alerts"}`;
    const description =
      page === "privacy"
        ? lang === "nl"
          ? "Het bestaande privacybeleid van Nestd, een dienst van Muba B.V."
          : "The existing Nestd privacy policy, a service of Muba B.V."
        : page === "about"
          ? aboutCopy[lang].intro
          : page === "pricing"
            ? t.priceNote
            : t.description;
    const body =
      page === "home"
        ? home(t, lang)
        : page === "pricing"
          ? pricing(t, lang)
          : page === "about"
            ? about(t, lang)
            : page === "download"
              ? download(t, true) + nextSteps(lang)
              : privacyContent(t, lang);
    const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="${escape(description)}">
<meta name="posthog-key" content="phc_uardbxGnhavwrDMNskL74udz6Z5NjCMrXsWYgGDK9VuS">
<link rel="canonical" href="https://www.nestd.nl${path}"><link rel="alternate" hreflang="nl" href="https://www.nestd.nl${pathFor("nl", page)}"><link rel="alternate" hreflang="en" href="https://www.nestd.nl${pathFor("en", page)}"><link rel="alternate" hreflang="x-default" href="https://www.nestd.nl${pathFor("nl", page)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Nestd"><meta property="og:locale" content="${lang === "nl" ? "nl_NL" : "en_GB"}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="https://www.nestd.nl${path}"><meta property="og:image" content="https://www.nestd.nl/images/og-${lang}.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${lang === "nl" ? "Nestd. Je volgende thuis. Blijf klaar om te reageren." : "Nestd. Your next home. Stay ready for your next move."}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/inter-normal-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/fonts/fonts.css">
<script src="/theme.js"></script><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/themes.css"><script src="/i18n.js"></script><script src="/script.js" defer></script>${page === "home" ? '<script src="/demo.js" defer></script>' : ""}
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Nestd", url: "https://www.nestd.nl/", inLanguage: lang, description: t.description, publisher: { "@type": "Organization", name: "Muba B.V.", brand: { "@type": "Brand", name: "Nestd" }, url: "https://www.nestd.nl/", logo: "https://www.nestd.nl/logo.png" } })}</script>
</head><body>
<a class="skip-link" href="#main">${t.skip}</a>
<header class="site-header"><div class="nav-inner"><a class="brand" href="${pathFor(lang, "home")}" aria-label="Nestd home"><img src="/images/brand-icon.png" alt="" width="40" height="40"><span>Nestd<span class="brand-dot">.</span></span></a><nav id="navigation" aria-label="${lang === "nl" ? "Hoofdnavigatie" : "Main navigation"}"><a href="${pathFor(lang, "home")}#how-it-works">${t.nav[0]}</a><a href="${pathFor(lang, "pricing")}" ${page === "pricing" ? 'aria-current="page"' : ""}>${t.nav[1]}</a><a href="${pathFor(lang, "about")}" ${page === "about" ? 'aria-current="page"' : ""}>${t.nav[2]}</a></nav><div class="nav-actions"><label class="theme-control" data-theme-control hidden><span class="theme-symbol" aria-hidden="true">◐</span><span class="sr-only">${lang === "nl" ? "Weergave" : "Appearance"}</span><select data-theme-select><option value="system">${lang === "nl" ? "Systeem" : "System"}</option><option value="light">${lang === "nl" ? "Licht" : "Light"}</option><option value="dark">${lang === "nl" ? "Donker" : "Dark"}</option></select></label><a class="language-link" href="${pathFor(other, page)}" lang="${other}" hreflang="${other}" aria-label="${other === "en" ? "Read in English" : "Lees in het Nederlands"}">${other.toUpperCase()}</a><a class="nav-download" href="${pathFor(lang, "download")}">${t.downloadPage} ${arrow}</a><button class="menu-toggle" aria-expanded="false" aria-controls="navigation" data-menu-label="${t.menu}" data-close-label="${t.close}">${t.menu}</button></div><a class="mobile-about-link" href="${pathFor(lang, "about")}" ${page === "about" ? 'aria-current="page"' : ""}>${t.aboutPage} <span aria-hidden="true">↗</span></a></div></header>
<main id="main" tabindex="-1" class="container">${body}</main>
<footer class="site-footer"><div class="container footer-grid"><div><a class="brand" href="${pathFor(lang, "home")}"><img src="/images/brand-icon.png" alt="" width="40" height="40"><span>Nestd<span class="brand-dot">.</span></span></a><p class="footer-statement">${t.footer}</p></div><div><p class="eyebrow">NESTD</p><a href="${pathFor(lang, "pricing")}">${t.pricingPage}</a><a href="${pathFor(lang, "about")}">${t.aboutPage}</a><a href="${pathFor(lang, "download")}">${t.downloadPage}</a></div><div><p class="eyebrow">${t.contact}</p><a href="mailto:hello@nestd.nl">hello@nestd.nl</a><a href="${pathFor(lang, "privacy")}">${t.privacy}</a><a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">${t.terms}</a></div></div><div class="container footer-bottom"><span>© 2026 Nestd · Muba B.V.</span><span>${t.paid}</span></div></footer>
${page === "home" ? `<div class="mobile-sticky" hidden>${cta(t, "mobile_sticky")}<span>${t.paid}</span></div>` : ""}
</body></html>`;
    write(
      path === "/"
        ? "index.html"
        : path === "/en/"
          ? "en/index.html"
          : path.slice(1),
      html,
    );
  }
write(
  "images/download-qr.svg",
  await QRCode.toString(APP_STORE, {
    type: "svg",
    margin: 2,
    width: 180,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  }),
);
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(
    copy,
  )
    .flatMap((lang) =>
      Object.keys(paths).map(
        (page) =>
          `<url><loc>https://www.nestd.nl${pathFor(lang, page)}</loc></url>`,
      ),
    )
    .join("")}</urlset>`,
);
write(
  "robots.txt",
  "User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /listing/\nDisallow: /app/\nSitemap: https://www.nestd.nl/sitemap.xml\n",
);
console.log(
  "Built 10 fully rendered NL/EN marketing/legal pages, sitemap and download QR.",
);
