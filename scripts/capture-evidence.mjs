import { chromium } from "@playwright/test";
import fs from "node:fs";
const dir = "test-artifacts/landing-app-storefront-2026-09-09";
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.route(/posthog\.com|facebook\.net|facebook\.com/, (r) => r.abort());
for (const [name, path, width, height] of [
  ["home-desktop-nl", "/", 1440, 1000],
  ["home-mobile-nl", "/", 390, 844],
  ["home-desktop-en", "/en/", 1440, 1000],
  ["home-mobile-en", "/en/", 390, 844],
  ["pricing-desktop", "/pricing.html", 1440, 1000],
  ["pricing-mobile", "/pricing.html", 390, 844],
  ["about-desktop", "/about.html", 1440, 1000],
  ["about-mobile", "/about.html", 390, 844],
  ["download-desktop", "/download.html", 1440, 1000],
  ["download-mobile", "/download.html", 390, 844],
]) {
  await page.setViewportSize({ width, height });
  await page.goto("http://127.0.0.1:4173" + path);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  if (name.startsWith("home-"))
    await page.screenshot({ path: `${dir}/${name}-hero.png` });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:4173/");
await page.locator(".menu-toggle").click();
await page.screenshot({ path: `${dir}/mobile-menu.png` });
await page.locator(".menu-toggle").click();
await page.locator("summary").first().click();
await page.locator("#faq").scrollIntoViewIfNeeded();
await page.screenshot({ path: `${dir}/mobile-faq.png` });
// Detail crops and the narrowest supported viewport complement full-page captures.
for (const [name, width, path, selector] of [
  ["features-desktop-nl", 1440, "/", ".storefront-features"],
  ["trust-desktop-nl", 1440, "/", ".trust-section"],
  ["home-320-en", 320, "/en/", null],
  ["features-mobile-en", 390, "/en/", ".storefront-features"],
]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://127.0.0.1:4173" + path);
  await page.evaluate(() => document.fonts.ready);
  if (selector)
    await page.locator(selector).screenshot({ path: `${dir}/${name}.png` });
  else await page.screenshot({ path: `${dir}/${name}.png` });
}
// Code-native social cards, generated from the actual brand and headline. No fabricated app data.
for (const lang of ["nl", "en"]) {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto("http://127.0.0.1:4173/" + (lang === "en" ? "en/" : ""));
  await page.evaluate((lang) => {
    const heading = document.querySelector("h1").innerHTML;
    const phones = document.querySelector(".app-showcase").outerHTML;
    document.body.innerHTML = `<div style="width:1200px;height:630px;padding:54px 64px;background:#0a0a0a;position:relative;overflow:hidden"><div class="brand"><img src="/images/brand-icon.png" alt=""><span>Nestd<span class="brand-dot">.</span></span></div><p class="eyebrow" style="margin-top:60px">${lang === "nl" ? "WONINGMELDINGEN · VOOR IPHONE" : "RENTAL ALERTS · FOR IPHONE"}</p><h1 style="font-size:58px;max-width:650px">${heading}</h1><p style="margin-top:28px;font-size:15px">${lang === "nl" ? "Betaald abonnement · nestd.nl" : "Paid subscription · nestd.nl"}</p><div style="position:absolute;right:30px;top:60px;width:480px;transform:scale(.82);transform-origin:top right">${phones}</div></div>`;
  }, lang);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `images/og-${lang}.png` });
}
await browser.close();
console.log(
  "Captured responsive pages, interaction states, and localized social cards.",
);
