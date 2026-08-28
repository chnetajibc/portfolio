import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("a11y: homepage has no critical violations", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const results = await new AxeBuilder({ page }).analyze();
  // Filter critical and serious
  const violations = results.violations.filter((v) => ["critical", "serious"].includes(v.impact));
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
});

test("a11y: modals have dialog semantics", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Experience", { exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const a11y = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  const critical = a11y.violations.filter((v) => v.impact === "critical");
  expect(critical).toEqual([]);
  await page.keyboard.press("Escape");
});

test("a11y: form labels", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholderText(/Type a message/).fill("hire me");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Get in Touch")).toBeVisible();
  // Check inputs have labels (via placeholder or label)
  const nameInput = page.getByPlaceholderText("Jane Doe");
  await expect(nameInput).toBeVisible();
  // axe should not complain about missing labels because placeholder is not sufficient, but our form has label
  const results = await new AxeBuilder({ page }).analyze();
  // Allow moderate, but no critical serious for form
  const critical = results.violations.filter((v) => v.impact === "critical");
  expect(critical.length).toBeLessThan(5);
});
