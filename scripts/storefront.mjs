import { storefront } from "../content/storefront.mjs";
export const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{ home: '<path d="m3 10 9-7 9 7v11H3zM9 21v-8h6v8"/>', filter: '<path d="M4 6h16M4 12h16M4 18h16"/><path d="M8 3v6m8 0v6m-6 0v6"/>', bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>', shield: '<path d="M12 3 3 6v6c0 5 9 9 9 9s9-4 9-9V6zM8 12l3 3 5-6"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 6 9 7 9-7"/>', arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>' }[name]}</svg>`;
const filters = (s) =>
  `<div class="mock-filters">${[3, 5, 7].map((i) => `<div><span>${s.screen[i]}</span><strong>${s.screen[i + 1]} <span>⌄</span></strong></div>`).join("")}</div>`;
const notice = (s, t) =>
  `<div class="mock-notice"><img src="/images/brand-icon.png" width="36" height="36" alt=""><div><span>Nestd · ${t.example}</span><strong>${t.notification}</strong><p>${t.notificationBody}</p></div></div>`;
const photo = (lazy) =>
  `<img class="mock-photo" src="/images/search-home-480.webp" alt="" width="480" height="357" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'}>`;
export function phones(t, lang, small = false) {
  const s = storefront[lang];
  return `<figure class="app-showcase ${small ? "small-showcase" : ""}"><div class="phone-stage" aria-hidden="true"><div class="phone-halo"></div><div class="phone phone-back"><div class="phone-island"></div><div class="phone-content"><div class="mock-header"><img src="/images/brand-icon.png" width="28" height="28" alt=""><b>Nestd</b></div><h3>${s.screen[2]}</h3><p class="mock-subtitle">${t.signal[0]}</p>${filters(s)}<div class="mock-saved">${icon("filter")} ${t.signal[1]}</div></div></div><div class="phone phone-front"><div class="phone-island"></div><div class="phone-content"><div class="mock-header"><img src="/images/brand-icon.png" width="28" height="28" alt=""><b>Nestd</b>${icon("bell")}</div><h3>${s.screen[0]}</h3><p class="mock-subtitle">${s.screen[1]}</p><div class="mock-listing">${photo(small)}<div class="mock-listing-copy"><span>${s.sample}</span><strong>${s.home}</strong><p>${t.signal[1]}</p><div class="mock-action">${s.details} ${icon("arrow")}</div></div></div><div class="mock-nav">${[0, 1, 2].map((i) => `<span>${icon(["home", "filter", "shield"][i])}${s.screen[9 + i]}</span>`).join("")}</div></div></div><div class="showcase-notice">${notice(s, t)}</div></div><figcaption>${s.caption}</figcaption></figure>`;
}
export function features(t, lang) {
  const s = storefront[lang];
  return `<section class="section storefront-features" data-section="value"><div class="section-heading"><p class="eyebrow">${s.valueLabel}</p><h2>${s.valueTitle}</h2></div><div class="feature-bento">${s.featureTitles.map((title, i) => `<article class="feature-tile"><div class="feature-art art-${i}" aria-hidden="true">${i === 0 ? filters(s) : i === 1 ? `<div class="notification-orbit">${icon("bell")}</div>${notice(s, t)}` : `<div class="provider-preview">${photo(true)}<span>${s.respond} ${icon("arrow")}</span></div>`}</div><div class="feature-description"><span class="feature-number">0${i + 1}</span><h3>${title}</h3><p>${s.featureBodies[i]}</p></div></article>`).join("")}</div><p class="art-caption">${s.caption}</p></section>`;
}
