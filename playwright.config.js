const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npx serve . -p 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'Desktop Chrome', use: { browserName: 'chromium' } }
  ]
});
