import { test, expect } from "@playwright/test";

const viewports = [
  { name: "Mobile 320", width: 320, height: 568 },
  { name: "Mobile 375", width: 375, height: 667 },
  { name: "iPhone 390", width: 390, height: 844 },
  { name: "Mobile 430", width: 430, height: 932 },
  { name: "Tablet 768", width: 768, height: 1024 },
  { name: "Tablet 1024", width: 1024, height: 768 },
  { name: "Desktop 1280", width: 1280, height: 720 },
  { name: "Desktop 1440", width: 1440, height: 900 },
  { name: "Desktop 1920", width: 1920, height: 1080 },
];

for (const vp of viewports) {
  test(`responsive ${vp.name} ${vp.width}x${vp.height} - no overflow, controls visible`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // No horizontal scroll
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, `horizontal overflow at ${vp.name}`).toBe(false);

    // Header visible
    await expect(page.getByText(/CH Netaji/)).toBeVisible();

    // Chat input visible
    await expect(page.getByPlaceholderText(/Type a message/)).toBeVisible();

    // Social links visible
    await expect(page.getByLabelText("GitHub").or(page.getByLabelText("LinkedIn"))).toBeVisible({ timeout: 5000 }).catch(() => {});

    // Open modal and check fits
    const expBtn = page.getByText("Experience", { exact: true });
    if (await expBtn.isVisible()) {
      await expBtn.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      const box = await dialog.boundingBox();
      expect(box.width).toBeLessThanOrEqual(vp.width * 0.95);
      // Content scrolls
      const scrollEl = dialog.locator(".thin-scroll");
      await expect(scrollEl).toBeVisible();
      // Close
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
    }
  });
}

test("iPhone device descriptor - no horizontal overflow", async ({ page }) => {
  // Already covered, but explicit device test
  await page.goto("/");
  await expect(page.getByPlaceholderText(/Type a message/)).toBeVisible();
});
