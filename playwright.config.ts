import { defineConfig, devices } from "@playwright/test";

// Browser tests run against the dev server (started automatically if it isn't already running).
// They only read pages and use client-side validation — they never submit forms or change data.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: { baseURL: process.env.E2E_BASE_URL || "http://localhost:3000" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
