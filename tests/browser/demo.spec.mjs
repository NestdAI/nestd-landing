import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.route(/posthog\.com|facebook\.net|facebook\.com/, (r) =>
    r.abort(),
  );
});
for (const colorScheme of ["light", "dark"])
  test(`${colorScheme}: walkthrough tabs have keyboard, contrast, explicit illustration and intent-only events`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    for (const [path, width] of [
      ["/", 320],
      ["/en/", 1440],
    ]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await page.evaluate(() => {
        window.demoEvents = [];
        window.nestdAnalytics = {
          track: (name, props) => demoEvents.push({ name, props }),
        };
      });
      const tabs = page.getByRole("tab");
      await expect(tabs).toHaveCount(3);
      await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
      await tabs.first().focus();
      await page.keyboard.press("ArrowRight");
      await expect(tabs.nth(1)).toBeFocused();
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tabpanel")).toHaveCount(1);
      for (const i of [1, 2]) {
        await tabs.nth(i).click();
        await expect(page.locator(`#demo-panel-${i}`)).toBeVisible();
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
      await page.keyboard.press("Home");
      await expect(tabs.first()).toBeFocused();
      await page.keyboard.press("End");
      await expect(tabs.last()).toBeFocused();
      expect(
        await page
          .locator("[data-demo] input,[data-demo] form,[data-demo] a")
          .count(),
      ).toBe(0);
      await expect(page.locator(".product-demo .art-caption")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
      const events = await page.evaluate(() =>
        demoEvents.filter((e) => e.name === "demo_step_viewed"),
      );
      expect(events).toHaveLength(5);
      for (const event of events) {
        expect(Object.keys(event.props).sort()).toEqual([
          "interaction",
          "step",
        ]);
        expect(event.props.step).toBeGreaterThan(0);
        expect(event.props.step).toBeLessThan(4);
      }
    }
  });
test("noJS walkthrough shows every step without dead controls; subscription boundaries remain visible", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  for (const path of ["/", "/en/"]) {
    await page.goto("http://127.0.0.1:4173" + path);
    await expect(page.locator("[data-demo-tabs]")).toBeHidden();
    for (const panel of await page.locator("[data-demo-panel]").all())
      await expect(panel).toBeVisible();
    await expect(page.locator(".clarity-grid article")).toHaveCount(2);
    expect(
      await page.locator("[data-demo] input,[data-demo] form").count(),
    ).toBe(0);
  }
  await context.close();
});
test("download explains payment confirmation and setup without collecting a fake search", async ({
  page,
}) => {
  for (const path of ["/download.html", "/en/download.html"]) {
    await page.goto(path);
    await expect(page.locator(".next-steps li")).toHaveCount(3);
    expect(await page.locator("form").count()).toBe(0);
    await expect(
      page.locator('[data-cta-placement="download"]'),
    ).toHaveAttribute(
      "href",
      "https://apps.apple.com/nl/app/nestd/id6761392857",
    );
  }
});
