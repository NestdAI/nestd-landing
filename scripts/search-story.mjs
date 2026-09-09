import { searchStory } from "../content/search-story.mjs";
import { icon } from "./storefront.mjs";
const points = (items) =>
  `<div class="story-points">${items.map(([title, body]) => `<div><h3>${title}</h3><p>${body}</p></div>`).join("")}</div>`;
export function searchNarrative(lang) {
  const c = searchStory[lang];
  return `<section class="section search-narrative" id="search" data-section="search_filters"><div class="narrative-copy"><p class="eyebrow">${c.searchLabel}</p><h2>${c.searchTitle}</h2><p class="section-intro">${c.searchIntro}</p>${points(c.searchPoints)}</div><figure class="criteria-figure"><div class="criteria-grid">${c.filters.map(([label, body], i) => `<div><span class="criteria-number" aria-hidden="true">0${i + 1}</span><h3>${label}</h3><p>${body}</p></div>`).join("")}</div><figcaption>${c.filterCaption}</figcaption></figure></section>`;
}
export function alertNarrative(lang) {
  const c = searchStory[lang];
  return `<section class="section alert-narrative" id="alerts" data-section="rental_alerts"><div class="narrative-copy"><p class="eyebrow">${c.alertsLabel}</p><h2>${c.alertsTitle}</h2><p class="section-intro">${c.alertsIntro}</p>${points(c.alertsPoints)}<a class="text-link" href="${lang === "en" ? "/en" : ""}/about.html#story">${c.storyLink} ↗</a></div><figure class="alert-story-figure"><div class="story-notification"><div class="story-notification-brand"><img src="/images/brand-icon.png" width="40" height="40" alt=""><span>Nestd <small>${c.alertExample}</small></span></div><h3>${c.alertTitle}</h3><p>${c.alertBody}</p></div><ol class="alert-story-steps">${c.alertSteps.map((step) => `<li>${icon("arrow")}<span>${step}</span></li>`).join("")}</ol><figcaption>${c.alertCaption}</figcaption><p class="notification-settings">${c.settings}</p></figure></section>`;
}
