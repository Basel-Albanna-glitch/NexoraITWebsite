// Regression: ISSUE-001 — on tablets (761–950px) the nav overflowed: language switch & theme toggle were off-screen
// Found by /qa on 2026-10-15
// Report: .gstack/qa-reports/qa-report-localhost-2026-10-15.md
// Value: protects=language & theme controls reachable on tablets; fails_when=the desktop nav is shown at widths it can't fit; why_new=site.spec.ts runs at desktop width only; seam=none; no_claim=widths below 768px (covered by the phone menu) and above 1280px (desktop nav has room)
import { expect, test } from "@playwright/test";

for (const width of [768, 820, 900, 1000, 1100, 1280]) {
  for (const path of ["/", "/ar"]) {
    test(`nav controls fit and are reachable at ${width}px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1024 });
      await page.goto(path);
      const inner = await page.locator(".nav__inner").evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth }));
      expect(inner.sw, "nav row must not overflow").toBeLessThanOrEqual(inner.cw);
      // Arabic labels wrapped onto two lines instead of overflowing: every visible top-level label stays on one line.
      const wrapped = await page.locator(".nav__links > a, .nav__group > a").evaluateAll((els) =>
        els.filter((el) => el.getBoundingClientRect().height > 0 && el.getClientRects().length > 1).map((el) => (el as HTMLElement).innerText));
      expect(wrapped, "nav labels must not wrap").toEqual([]);

      // The way to change language or theme must be visible on screen at this width.
      await expect(page.locator(".theme-toggle")).toBeInViewport({ ratio: 1 });
      const langSwitch = page.locator(".lang-switch");
      if (await langSwitch.isVisible()) {
        await expect(langSwitch).toBeInViewport({ ratio: 1 });
      } else {
        await page.locator(".nav__toggle").click();
        await expect(page.locator(".nav__lang-mobile")).toBeInViewport({ ratio: 1 });
      }
    });
  }
}
