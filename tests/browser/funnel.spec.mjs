import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const paths = [
  "/",
  "/pricing.html",
  "/about.html",
  "/download.html",
  "/privacy.html",
  "/en/",
  "/en/pricing.html",
  "/en/about.html",
  "/en/download.html",
  "/en/privacy.html",
];
// Tests never send analytics or mutate the production product.
test.beforeEach(async ({ page }) => {
  await page.route(/posthog\.com|facebook\.net|facebook\.com/, (r) =>
    r.abort(),
  );
});
for (const width of [390, 1440])
  for (const path of paths)
    test(`${width}px ${path}: routes, layout, accessibility`, async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const response = await page.goto(path);
      expect(response.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      const expectedLang = path.startsWith("/en/") ? "en" : "nl";
      await expect(page.locator("html")).toHaveAttribute("lang", expectedLang);
      const links = await page
        .locator("a[href]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      for (const href of new Set(links)) {
        expect(href).not.toBe("#");
        if (href.startsWith("/") && !href.startsWith("//")) {
          const url = new URL(href, "http://127.0.0.1:4173");
          expect((await request.get(url.pathname)).status(), href).toBe(200);
          if (url.hash) {
            const resp = await request.get(url.pathname);
            expect(await resp.text(), href).toContain(
              'id="' + url.hash.slice(1) + '"',
            );
          }
        }
        if (href.includes("apps.apple.com"))
          expect(href).toBe("https://apps.apple.com/nl/app/nestd/id6761392857");
      }
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        axe.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
      expect(errors).toEqual([]);
    });
test("keyboard menu, Escape, skip link and native FAQ", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  const toggle = page.locator(".menu-toggle");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.locator("summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("details").first()).toHaveAttribute("open", "");
});
test("legacy locale campaigns keep attribution and anchors; explicit language navigation works", async ({
  page,
}) => {
  await page.goto(
    "/pricing.html?lang=en&utm_source=meta&utm_campaign=rentals#faq",
  );
  await expect(page).toHaveURL(
    /\/en\/pricing.html\?utm_source=meta&utm_campaign=rentals#faq/,
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.locator(".language-link").click();
  await expect(page).toHaveURL(
    /\/pricing.html\?utm_source=meta&utm_campaign=rentals#faq/,
  );
});
test("no JavaScript: both locales, menus, FAQs and store links remain usable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  for (const path of ["/", "/en/"]) {
    await page.goto("http://127.0.0.1:4173" + path);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#navigation")).toBeVisible();
    await page.locator("summary").first().click();
    await expect(page.locator("details").first()).toHaveAttribute("open", "");
  }
  await context.close();
});
test("small screens, zoom and reduced motion stay readable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  expect(
    await page
      .locator("html")
      .evaluate((el) => getComputedStyle(el).scrollBehavior),
  ).toBe("auto");
  await page.setViewportSize({ width: 640, height: 450 });
  await page.goto("/"); // 1280px viewport at 200% zoom-equivalent CSS width.
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("sticky CTA appears after hero, hides at download and footer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sticky = page.locator(".mobile-sticky");
  await expect(sticky).toBeHidden();
  await page.locator("#how-it-works").scrollIntoViewIfNeeded();
  await expect(sticky).toBeVisible();
  await page.locator("#download").scrollIntoViewIfNeeded();
  await expect(sticky).toBeHidden();
});
test("store click emits intent once, never purchase; listing routes do not load analytics", async ({
  page,
}) => {
  await page.goto("/?utm_source=test");
  await page.evaluate(() => {
    window.events = [];
    window.nestdAnalytics = {
      track: (e, p) => events.push([e, p]),
      trackMeta: (e, p) => events.push(["meta:" + e, p]),
    };
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-cta-placement]")) e.preventDefault();
    });
  });
  await page.locator('[data-cta-placement="hero"]').click();
  const events = await page.evaluate(() => events);
  expect(events.filter(([e]) => e === "cta_clicked")).toHaveLength(1);
  expect(events.some(([e]) => /Purchase|Subscribe|Lead/.test(e))).toBeFalsy();
  await page.goto("/listing/example-id");
  await expect(page.locator("#open-app")).toHaveAttribute(
    "href",
    "nestd://listing/example-id",
  );
  expect(await page.locator('script[src="/script.js"]').count()).toBe(0);
  expect(await page.evaluate(() => location.pathname)).toBe(
    "/listing/example-id",
  );
  await page.goto("/app");
  await expect(page.locator("#open-app")).toHaveAttribute("href", "nestd://");
});

test("legacy feature and verification routes preserve their destinations without backend calls", async ({
  page,
  request,
}) => {
  await page.goto("/features.html?lang=en&utm_source=legacy");
  await expect(page).toHaveURL(/\/en\/\?utm_source=legacy#how-it-works/);
  for (const [path, heading] of [
    ["/verified", "E-mail bevestigd"],
    ["/verify-error", "Verificatie mislukt"],
  ]) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(heading);
    expect(await page.locator('a[href="nestd://"]').count()).toBe(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex",
    );
  }
  const association = await request.get(
    "/.well-known/apple-app-site-association",
  );
  expect(association.status()).toBe(200);
  expect((await association.json()).applinks.details[0].paths).toContain(
    "/listing/*",
  );
});
