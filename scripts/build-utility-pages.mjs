import fs from "node:fs";
import { APP_STORE } from "../content/marketing.mjs";
const pages = [
  {
    file: "app/index.html",
    title: "Open Nestd",
    body: "Explore rental listings and your search preferences in Nestd.",
    deep: "nestd://",
    analytics: true,
  },
  {
    file: "listing/index.html",
    title: "View this rental in Nestd",
    body: "Open this listing to review the details and continue to the original provider. Availability and provider conditions may change.",
    deep: "nestd://",
    listing: true,
  },
];
for (const p of pages)
  fs.writeFileSync(
    new URL("../" + p.file, import.meta.url),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${p.title}</title><meta name="description" content="${p.body}">${p.analytics ? '<meta name="posthog-key" content="phc_uardbxGnhavwrDMNskL74udz6Z5NjCMrXsWYgGDK9VuS">' : ""}<link rel="icon" href="/favicon.ico"><script src="/theme.js"></script><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/themes.css">${p.analytics ? '<script src="/script.js" defer></script>' : ""}<script src="/deeplink.js" defer></script></head><body><main class="utility-page" data-kind="${p.listing ? "listing" : "app"}"><a class="brand" href="/en/"><img src="/images/brand-icon.png" alt="" width="40" height="40"><span>Nestd<span class="brand-dot">.</span></span></a><h1>${p.title}</h1><p>${p.body}</p><a id="open-app" class="button" href="${p.deep}">Open in Nestd <span aria-hidden="true">↗</span></a><p class="fine-print">Don't have the app? A paid subscription is required to use Nestd.</p><a class="text-link" href="${APP_STORE}" data-cta-placement="${p.listing ? "listing_fallback" : "app_fallback"}">Download for iPhone <span aria-hidden="true">↗</span></a><a class="text-link" href="/en/about.html">About Nestd</a></main></body></html>`,
  );
