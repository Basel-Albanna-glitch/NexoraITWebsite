import { expect, test } from "@playwright/test";

// Read-only checks: nothing here submits a form or writes data.

test("English home renders left-to-right with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test("language switch goes to the same page in Arabic, right-to-left", async ({ page }) => {
  await page.goto("/services/pos");
  await page.locator("a.lang-switch").click();
  await expect(page).toHaveURL(/\/ar\/services\/pos$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
});

test("contact form shows Arabic validation messages without sending", async ({ page }) => {
  let posted = false;
  page.on("request", (r) => { if (r.url().includes("/api/contact")) posted = true; });
  await page.goto("/ar/contact");
  await page.getByRole("button", { name: "أرسل الرسالة" }).click();
  await expect(page.getByText("يرجى كتابة اسمك.")).toBeVisible();
  expect(posted).toBe(false);
});

test("unknown pages return 404 in both languages", async ({ request }) => {
  expect((await request.get("/no-such-page")).status()).toBe(404);
  expect((await request.get("/ar/no-such-page")).status()).toBe(404);
});
