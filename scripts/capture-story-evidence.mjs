import { chromium } from "@playwright/test";
const dir = "test-artifacts/landing-live-content-2026-09-09";
const browser = await chromium.launch({ channel: "chrome" });
for (const [lang, theme, width] of [
  ["nl", "light", 1440],
  ["nl", "dark", 390],
  ["en", "dark", 1440],
  ["en", "light", 390],
  ["en", "dark", 320],
]) {
  const context = await browser.newContext({
    colorScheme: theme,
    viewport: { width, height: 900 },
  });
  const page = await context.newPage();
  await page.route(/posthog\.com|facebook\.net|facebook\.com/, (r) =>
    r.abort(),
  );
  await page.goto("http://127.0.0.1:4173/" + (lang === "en" ? "en/" : ""));
  await page.evaluate(() => document.fonts.ready);
  for (const section of ["search", "alerts"]) {
    await page
      .locator("#" + section)
      .screenshot({
        path: `${dir}/${section}-${lang}-${theme}-${width}.png`,
        style: ".mobile-sticky, .skip-link:not(:focus) { visibility:hidden !important; }",
      });
  }
  if (width === 390)
    await page.screenshot({
      path: `${dir}/alerts-${lang}-${theme}-${width}-viewport.png`,
    });
  await context.close();
}
await browser.close();
