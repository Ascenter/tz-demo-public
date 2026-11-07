import { defineConfig, devices } from '@playwright/test'

// e2e runs the production build (vite preview) in WebKit with the iPhone 15 Pro profile.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 240_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    serviceWorkers: 'block', // the SW is checked separately; tests always load fresh code
  },
  projects: [{ name: 'webkit-iphone', use: { ...devices['iPhone 15 Pro'] } }],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
