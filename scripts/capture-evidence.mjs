import { chromium } from "@playwright/test";
import fs from "node:fs";
const dir = "test-artifacts/landing-2026-09-09";
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
// Code-native social cards, generated from the actual brand and headline. No fabricated app data.
for (const lang of ["nl", "en"]) {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto("http://127.0.0.1:4173/" + (lang === "en" ? "en/" : ""));
  await page.evaluate((lang) => {
    document.body.innerHTML = `<div style="width:1200px;height:630px;padding:64px 80px;background:#0a0a0a;position:relative;overflow:hidden"><div class="brand"><img src="/logo.png" alt=""><span>Nestd<span class="brand-dot">.</span></span></div><p class="eyebrow" style="margin-top:50px">${lang === "nl" ? "VOOR JE VOLGENDE THUIS" : "FOR YOUR NEXT CHAPTER"}</p><h1 style="font-size:92px">${lang === "nl" ? "Minder refreshen.<br>Meer <em>reageren.</em>" : "Less refreshing.<br>More <em>responding.</em>"}</h1><p style="margin-top:30px;font-size:18px">${lang === "nl" ? "Woningmeldingen · Betaald abonnement" : "Rental alerts · Paid subscription"}</p><div style="position:absolute;right:-130px;top:40px;width:360px;height:560px;border:1px solid #ff385c70;border-radius:50%;transform:rotate(25deg)"></div></div>`;
  }, lang);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `images/og-${lang}.png` });
}
await browser.close();
console.log(
  "Captured responsive pages, interaction states, and localized social cards.",
);
