import { conversion } from "../content/conversion.mjs";
import { icon } from "./storefront.mjs";
export function demo(lang) {
  const c = conversion[lang];
  const art = [
    `<div class="demo-profile">${c.fieldLabels.map((label, i) => `<div><span>${label}</span><strong>${c.fieldValues[i]}</strong></div>`).join("")}</div>`,
    `<div class="demo-alert"><img src="/images/brand-icon.png" width="44" height="44" alt=""><span>Nestd · ${c.example}</span><strong>${c.alertTitle}</strong><p>${c.alertBody}</p></div>`,
    `<div class="demo-response"><img src="/images/search-home-480.webp" alt="" width="480" height="357" loading="lazy"><div><strong>${c.reviewTitle}</strong><ul>${c.reviewChecks.map((s) => `<li>${icon("arrow")}${s}</li>`).join("")}</ul></div></div>`,
  ];
  return `<section class="section product-demo" id="how-it-works" data-section="how_it_works"><div class="section-heading split-heading"><div><p class="eyebrow">${c.demoLabel}</p><h2>${c.demoTitle}</h2></div><p>${c.demoIntro}</p></div><div class="demo-widget" data-demo><div class="demo-tabs" data-demo-tabs aria-label="${c.demoNav}" hidden>${c.demoTabs.map((tab, i) => `<button type="button" id="demo-tab-${i}" data-demo-tab="${i}"><span aria-hidden="true">0${i + 1}</span>${tab}</button>`).join("")}</div><div class="demo-panels">${c.demo.map(([title, body, note], i) => `<article class="demo-panel" id="demo-panel-${i}" data-demo-panel="${i}"><div class="demo-art" aria-hidden="true">${art[i]}</div><div class="demo-explanation"><p class="eyebrow">0${i + 1} / ${c.demoTabs[i]}</p><h3>${title}</h3><p>${body}</p><div class="demo-note">${icon("shield")}<p>${note}</p></div></div></article>`).join("")}</div></div><p class="art-caption">${c.demoCaption}</p></section>`;
}
export function clarity(lang) {
  const c = conversion[lang];
  return `<section class="section clarity-section" data-section="service_scope"><div class="section-heading split-heading"><div><p class="eyebrow">${c.clarityLabel}</p><h2>${c.clarityTitle}</h2></div><p>${c.clarityIntro}</p></div><div class="clarity-grid">${c.clarity.map(([title, body, points], i) => `<article><div class="clarity-icon">${icon(i ? "home" : "bell")}</div><h3>${title}</h3><p>${body}</p><ul>${points.map((point) => `<li>${icon("arrow")}${point}</li>`).join("")}</ul></article>`).join("")}</div><p class="fit-note">${c.fit}</p></section>`;
}
export function nextSteps(lang) {
  const c = conversion[lang];
  return `<section class="section next-steps" data-section="download_next_steps"><div class="section-heading"><p class="eyebrow">${c.nextLabel}</p><h2>${c.nextTitle}</h2></div><ol>${c.next.map(([title, body], i) => `<li><span>0${i + 1}</span><h3>${title}</h3><p>${body}</p></li>`).join("")}</ol></section>`;
}
