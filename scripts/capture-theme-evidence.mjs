import { chromium } from "@playwright/test";
import fs from "node:fs";
const dir = "test-artifacts/landing-themes-about-2026-09-09";
fs.mkdirSync(dir, { recursive: true });
const onlyPage = process.argv[2];
const browser = await chromium.launch({ channel: "chrome" });
for (const theme of ["light", "dark"]) {
  const context = await browser.newContext({
    colorScheme: theme,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.route(/posthog\.com|facebook\.net|facebook\.com/, (r) =>
    r.abort(),
  );
  for (const lang of ["nl", "en"])
    for (const [size, width, height] of [
      ["desktop", 1440, 1000],
      ["mobile", 390, 844],
    ])
      for (const name of ["home", "about", "pricing", "download"].filter(
        (name) => !onlyPage || name === onlyPage,
      )) {
        const path =
          (lang === "en" ? "/en/" : "/") +
          (name === "home" ? "" : `${name}.html`);
        await page.setViewportSize({ width, height });
        await page.goto("http://127.0.0.1:4173" + path);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: `${dir}/${name}-${lang}-${theme}-${size}.png`,
          fullPage: true,
        });
        if (["home", "about"].includes(name))
          await page.screenshot({
            path: `${dir}/${name}-${lang}-${theme}-${size}-hero.png`,
          });
      }
  for (const name of ["home", "about"].filter(
    (name) => !onlyPage || name === onlyPage,
  )) {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(
      "http://127.0.0.1:4173/en/" + (name === "home" ? "" : `${name}.html`),
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${dir}/${name}-en-${theme}-320.png` });
  }
  await context.close();
}
await browser.close();
console.log(
  "Captured NL/EN light/dark desktop/mobile home, About, pricing, download and320px.",
);
