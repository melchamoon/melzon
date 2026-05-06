import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3100' },
  webServer: {
    command: 'pnpm start --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: false,
    timeout: 60000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'mobile', use: { browserName: 'webkit', viewport: { width: 390, height: 844 } } },
  ],
});
