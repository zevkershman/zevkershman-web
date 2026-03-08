const { test, expect } = require('@playwright/test');

test('page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Zev Kershman/);
});
