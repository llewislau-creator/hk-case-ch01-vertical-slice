import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: './tests',
 testMatch: '**/*.smoke.spec.js',
 use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', headless: true },
 webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 60000 },
 reporter: [['list'], ['html', { open: 'never' }]],
 timeout: 45000,
 retries: 1
});
