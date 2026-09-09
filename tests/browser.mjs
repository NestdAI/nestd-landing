import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
const server = spawn(
  "python3",
  ["-m", "http.server", "3189", "--directory", "dist"],
  { stdio: "ignore" },
);
const origin = "http://127.0.0.1:3189";
let browser;
try {
  for (let i = 0; i < 30; i++) {
    try {
      if ((await fetch(origin)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch({
    channel: process.env.CI ? undefined : "chrome",
    headless: true,
  });
  const pages = [
    "/",
    "/about.html",
    "/pricing.html",
    "/privacy.html",
    "/en/",
    "/en/about.html",
    "/en/pricing.html",
    "/en/privacy.html",
  ];
  let renderChecks = 0,
    a11yChecks = 0;
  for (const colorScheme of ["light", "dark"]) {
    const context = await browser.newContext({
      colorScheme,
      viewport: { width: 1440, height: 950 },
      reducedMotion: "reduce",
    });
    await context.route(/posthog|facebook/, (r) => r.abort());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of pages) {
      await page.goto(origin + route);
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        axe.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        [],
        route + " " + colorScheme + " accessibility",
      );
      a11yChecks++;
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 950 });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          route + " " + width + " " + colorScheme + " overflow",
        );
        renderChecks++;
      }
      const localLinks = await page
        .locator("a[href]")
        .evaluateAll((links) =>
          links.map((a) => a.href).filter((h) => h.startsWith(location.origin)),
        );
      for (const link of new Set(localLinks)) {
        const u = new URL(link);
        assert.ok(
          (await page.request.get(u.origin + u.pathname)).ok(),
          "local link " + link,
        );
      }
      await page.setViewportSize({ width: 1440, height: 950 });
    }
    assert.deepEqual(errors, [], "No marketing runtime exceptions");
    await page.goto(origin + "/");
    await page.locator('input[name="theme"][value="system"]').focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page.evaluate(() => localStorage.getItem("nestd-theme")),
      "light",
      "native radio arrow-key control",
    );
    await page
      .locator('.theme-switch label:has(input[value="system"])')
      .click();
    await page.goto(origin + "/?utm_source=meta&utm_campaign=fresh");
    await page
      .locator(
        `.theme-switch label:has(input[value="${colorScheme === "light" ? "dark" : "light"}"])`,
      )
      .click();
    const selected = colorScheme === "light" ? "dark" : "light";
    assert.equal(
      await page.evaluate(() => localStorage.getItem("nestd-theme")),
      selected,
    );
    await page.goto(origin + "/about.html");
    assert.equal(
      await page.locator("html").getAttribute("data-theme"),
      selected,
      "theme persists across pages",
    );
    await page.reload();
    assert.equal(
      await page.locator("html").getAttribute("data-theme"),
      selected,
      "theme persists on reload",
    );
    await page
      .locator('.theme-switch label:has(input[value="system"])')
      .click();
    assert.equal(
      await page.locator("html").getAttribute("data-theme"),
      null,
      "system removes forced theme",
    );
    await page.goto(origin + "/?utm_source=meta&utm_campaign=fresh");
    await page.locator("[data-language]").click();
    assert.equal(new URL(page.url()).pathname, "/en/");
    assert.equal(new URL(page.url()).searchParams.get("utm_campaign"), "fresh");
    await page.waitForFunction(() => Boolean(window.nestdAnalytics));
    const attribution = await page.evaluate(() =>
      window.nestdAnalytics.getAttribution(),
    );
    assert.equal(attribution.utm_source, "meta");
    await page.goto(origin + "/?lang=en&utm_campaign=direct");
    await page.waitForURL("**/en/?utm_campaign=direct");
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    await page.evaluate(() => {
      window.__events = [];
      window.nestdAnalytics.track = (...v) => window.__events.push(v);
      window.nestdAnalytics.trackMeta = () => {};
    });
    const popup = page.waitForEvent("popup");
    await page.locator("[data-cta-placement=hero]").click();
    const app = await popup;
    await app.close();
    assert.ok(
      (await page.evaluate(() => window.__events)).some(
        ([event, props]) =>
          event === "cta_clicked" && props.placement === "hero",
      ),
      "CTA intent emitted, not signup/purchase",
    );
    await page.locator("summary").first().focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page.locator("details").first().getAttribute("open"),
      "",
      "FAQ keyboard support",
    );
    await context.close();
  }
  const nojs = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: "dark",
    viewport: { width: 320, height: 800 },
  });
  const p = await nojs.newPage();
  for (const route of pages) {
    await p.goto(origin + route);
    assert.ok(await p.locator("h1").isVisible(), route + " no-JS content");
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      "no-JS narrow overflow",
    );
  }
  await p.goto(origin + "/");
  await p.locator("[data-language]").click();
  assert.equal(new URL(p.url()).pathname, "/en/");
  await p.locator("summary").first().click();
  assert.equal(await p.locator("details").first().getAttribute("open"), "");
  await nojs.close();
  const motionContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await motionContext.route(/posthog|facebook/, (r) => r.abort());
  const mp = await motionContext.newPage();
  await mp.goto(origin + "/");
  const deviceControl = mp.locator(".motion-control");
  await deviceControl.click();
  assert.equal(await deviceControl.getAttribute("aria-pressed"), "true");
  assert.equal(
    await mp
      .locator(".device-showcase")
      .evaluate((el) => el.getAnimations({ subtree: true }).length),
    0,
    "pause cancels device choreography",
  );
  await deviceControl.click();
  assert.equal(await deviceControl.getAttribute("aria-pressed"), "false");
  await mp.locator("#speed").scrollIntoViewIfNeeded();
  await mp.waitForTimeout(850);
  assert.ok(await mp.locator(".reach-cards article").first().isVisible());
  const disclosure = mp.locator('.faq-items details').first();
  const summary = disclosure.locator('summary');
  await summary.scrollIntoViewIfNeeded();
  const closedHeight = await disclosure.evaluate(el => el.getBoundingClientRect().height);
  await summary.focus();
  await mp.keyboard.press('Enter');
  assert.ok(await disclosure.evaluate(el => el.getAnimations().length > 0), 'FAQ opens with animation');
  await mp.waitForTimeout(350);
  assert.ok(await disclosure.evaluate(el => el.getBoundingClientRect().height) > closedHeight);
  await mp.keyboard.press('Enter');
  assert.ok(await disclosure.evaluate(el => el.getAnimations().length > 0), 'FAQ closes with animation');
  await mp.waitForTimeout(350);
  assert.equal(await disclosure.getAttribute('open'), null);
  await summary.click();
  await mp.waitForTimeout(75);
  await summary.click();
  await mp.waitForTimeout(350);
  assert.equal(await disclosure.getAttribute('open'), null, 'rapid reversal settles closed');
  assert.equal(await mp.locator('[data-proof-preview] .proof-reviews figure').count(), 3);
  assert.match(await mp.locator('[data-proof-preview]').innerText(), /FICTIEVE PLACEHOLDER/);
  await mp.locator('[data-proof-preview]').scrollIntoViewIfNeeded();
  await mp.screenshot({path: '/tmp/nestd-placeholders-mobile.png'});
  await mp.setViewportSize({width: 1440, height: 1000});
  await mp.screenshot({path: '/tmp/nestd-placeholders-desktop.png'});
  await mp.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await mp.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
    0,
    "reduced motion cancels running animation",
  );
  await deviceControl.waitFor({ state: "hidden" });
  await mp.goto(origin + "/pricing.html");
  assert.match(await mp.locator(".offer-summary").innerText(), /19,99/);
  assert.match(await mp.locator(".subscription").innerText(), /eerste.*week/i);
  await motionContext.close();
  console.log(
    `${renderChecks} viewport/theme checks; ${a11yChecks} axe page/theme scans; eight no-JS routes; local links, FAQ keyboard, system/persistent theme, bilingual attribution and CTA intent passed.`,
  );
} finally {
  await browser?.close();
  server.kill();
}
