import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { message: "Mock reply" }, meta: { requestId: "1" } }),
    });
  });
  await page.route("**/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { message: "ok" }, meta: { requestId: "1" } }),
    });
  });
});

async function stabilize(page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  // Disable animations for deterministic snapshots (test-only)
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
      .bg-aurora::before, .bg-aurora::after { animation: none !important; }
    `,
  });
}

test("visual: homepage desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await stabilize(page);
  await expect(page).toHaveScreenshot("homepage-desktop.png", { maxDiffPixels: 100 });
});

test("visual: homepage mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await stabilize(page);
  await expect(page).toHaveScreenshot("homepage-mobile.png", { maxDiffPixels: 100 });
});

test("visual: homepage tablet", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  await stabilize(page);
  await expect(page).toHaveScreenshot("homepage-tablet.png", { maxDiffPixels: 100 });
});

test("visual: dark theme", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("nbc-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await page.reload();
  await stabilize(page);
  await expect(page).toHaveScreenshot("homepage-dark.png", { maxDiffPixels: 100 });
});

test("visual: light theme", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("nbc-theme", "light");
    document.documentElement.classList.remove("dark");
  });
  await page.reload();
  await stabilize(page);
  await expect(page).toHaveScreenshot("homepage-light.png", { maxDiffPixels: 100 });
});

test("visual: experience modal", async ({ page }) => {
  await page.goto("/");
  await stabilize(page);
  await page.getByText("Experience", { exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForTimeout(300);
  await expect(page.getByRole("dialog")).toHaveScreenshot("modal-experience.png", { maxDiffPixels: 100 });
});

test("visual: chat open", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholderText(/Type a message/).fill("hello");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  await expect(page.getByText("hello")).toBeVisible();
  await stabilize(page);
  await expect(page).toHaveScreenshot("chat-open.png", { maxDiffPixels: 100 });
});

test("visual: contact form", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholderText(/Type a message/).fill("hire me");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Get in Touch")).toBeVisible();
  await page.waitForTimeout(300);
  await expect(page.getByText("Get in Touch").locator("..").first()).toHaveScreenshot("contact-form.png", { maxDiffPixels: 100 });
});
