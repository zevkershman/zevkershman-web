const { test, expect } = require('@playwright/test');

test('page has skip nav link', async ({ page }) => {
  await page.goto('/');
  const skipNav = page.locator('.skip-nav');
  await expect(skipNav).toBeAttached();
});
