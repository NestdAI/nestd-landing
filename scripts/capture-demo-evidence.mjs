import { chromium } from "@playwright/test";
const b = await chromium.launch({ channel: "chrome" });
for (const [lang, theme, width] of [
  ["nl", "light", 1440],
  ["en", "dark", 390],
]) {
  const c = await b.newContext({
    colorScheme: theme,
    viewport: { width, height: 950 },
  });
  const p = await c.newPage();
  await p.route(/posthog\.com|facebook\.net|facebook\.com/, (r) => r.abort());
  await p.goto("http://127.0.0.1:4173/" + (lang === "en" ? "en/" : ""));
  await p.evaluate(() => document.fonts.ready);
  for (let i = 0; i < 3; i++) {
    await p.getByRole("tab").nth(i).click();
    await p.locator(".product-demo").screenshot({
      style: ".mobile-sticky { visibility: hidden !important; }",
      path: `test-artifacts/landing-conversion-2026-09-09/demo-${lang}-${theme}-${width}-step${i + 1}.png`,
    });
  }
  await p.locator(".clarity-section").screenshot({
    style: ".mobile-sticky { visibility: hidden !important; }",
    path: `test-artifacts/landing-conversion-2026-09-09/clarity-${lang}-${theme}-${width}.png`,
  });
  if (width < 760) {
    await p.getByRole("tab").nth(1).click();
    await p.screenshot({
      path: `test-artifacts/landing-conversion-2026-09-09/demo-${lang}-${theme}-${width}-viewport.png`,
    });
  }
  await c.close();
}
await b.close();
