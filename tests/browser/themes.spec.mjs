import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const background = (page) =>
  page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
test.beforeEach(async ({ page }) => {
  await page.route(/posthog\.com|facebook\.net|facebook\.com/, (r) =>
    r.abort(),
  );
});
test("system changes follow live; manual choice persists through routes, locales and reload; system resets it", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.getByLabel("Weergave")).toHaveValue("system");
  const light = await background(page);
  await page.emulateMedia({ colorScheme: "dark" });
  const dark = await background(page);
  expect(dark).not.toBe(light);
  await page.getByLabel("Weergave").selectOption("light");
  expect(await background(page)).toBe(light);
  await page.goto("/about.html");
  expect(await background(page)).toBe(light);
  await expect(page.getByLabel("Weergave")).toHaveValue("light");
  await page.locator(".language-link").click();
  await expect(page).toHaveURL(/\/en\/about.html/);
  await expect(page.getByLabel("Appearance")).toHaveValue("light");
  await page.reload();
  expect(await background(page)).toBe(light);
  await page.goto("/en/pricing.html");
  await expect(page.getByLabel("Appearance")).toHaveValue("light");
  await page.getByLabel("Appearance").selectOption("dark");
  await page.emulateMedia({ colorScheme: "light" });
  expect(await background(page)).toBe(dark);
  await page.getByLabel("Appearance").selectOption("system");
  expect(await background(page)).toBe(light);
  expect(
    await page.evaluate(() => localStorage.getItem("nestd-theme")),
  ).toBeNull();
});
test("saved preference is applied while body markup is still unavailable, before stylesheet paint", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    localStorage.setItem("nestd-theme", "dark");
    window.themeAtStylesheet = null;
    new MutationObserver(() => {
      if (
        document.querySelector('link[href="/styles.css"]') &&
        !window.themeAtStylesheet
      )
        window.themeAtStylesheet = document.documentElement.dataset.theme;
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/");
  expect(await page.evaluate(() => window.themeAtStylesheet)).toBe("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("storage unavailable still permits manual themes and keyboard selection", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = function () {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = function () {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.removeItem = function () {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en/");
  const select = page.getByLabel("Appearance");
  await select.focus();
  await page.keyboard.press("d");
  await page.keyboard.press("Enter");
  await expect(select).toHaveValue("dark");
  await expect(select).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});
for (const colorScheme of ["light", "dark"]) {
  test(`noJS ${colorScheme}: system appearance, complete About and visible navigation`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      colorScheme,
      viewport: { width: 320, height: 900 },
    });
    const page = await context.newPage();
    for (const path of ["/about.html", "/en/about.html"]) {
      await page.goto("http://127.0.0.1:4173" + path);
      expect(
        await page
          .locator("html")
          .evaluate((el) => getComputedStyle(el).colorScheme),
      ).toBe(colorScheme);
      await expect(page.locator("[data-theme-control]")).toBeHidden();
      await expect(page.locator("#navigation")).toBeVisible();
      await expect(page.locator("#story")).toBeVisible();
      await expect(page.locator("#contact")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
    await context.close();
  });
  test(`${colorScheme}: prominent About links, full content, narrow layout, reduced motion and contrast`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    for (const [width, path, about] of [
      [1440, "/", "/about.html"],
      [320, "/en/", "/en/about.html"],
    ]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const link =
        width === 320
          ? page.locator(".mobile-about-link")
          : page.locator("#navigation a").last();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", about);
      await link.click();
      await expect(page).toHaveURL(new RegExp(about.replace(".", "\\.")));
      await expect(page.locator("#story")).toBeVisible();
      await expect(page.locator(".story-copy p")).toHaveCount(3);
      await expect(page.locator(".about-values article")).toHaveCount(3);
      await expect(page.locator("main")).not.toContainText("Muba B.V.");
      await expect(page.locator("footer")).toContainText("Muba B.V.");
      await expect(page.locator("#contact")).toContainText("hello@nestd.nl");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      expect(
        await page
          .locator("html")
          .evaluate((el) => getComputedStyle(el).scrollBehavior),
      ).toBe("auto");
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        axe.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  });
}

test("mobile header keeps its geometry while deferred handlers load", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/script.js", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/", { waitUntil: "commit" });
  await expect(page.locator("#main")).toBeVisible();
  // FontFaceSet.ready can wait for document load on Chromium, which this test
  // deliberately holds open. Load only the actual layout font instead.
  await page.evaluate(() => document.fonts.load('500 14px "Inter"'));
  const before = await page
    .locator("#main")
    .evaluate((el) => el.getBoundingClientRect().top);
  release();
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByLabel("Weergave")).toBeVisible();
  const after = await page
    .locator("#main")
    .evaluate((el) => el.getBoundingClientRect().top);
  expect(after).toBe(before);
});
