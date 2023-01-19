// eslint-disable-next-line import/no-extraneous-dependencies
import { devices, PlaywrightTestConfig } from '@playwright/test'
import path from 'path'

const baseURL = process.env.E2E_BASE_URL || 'http://172.17.0.1:8000'

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  globalSetup: path.join(__dirname, 'e2e', 'utils', 'global-setup.ts'),
  globalTeardown: path.join(__dirname, 'e2e', 'utils', 'global-teardown.ts'),
  timeout: 2 * 60 * 1000, // 2 min
  testDir: path.join(__dirname, 'e2e'),
  retries: 0,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: path.join(__dirname, 'e2e_results/'),
  webServer: {
    command: 'npm run prod',
    url: baseURL,
    timeout: 60 * 1000, // 1 min
    reuseExistingServer: true,
  },
  workers: process.env.CI ? 4 : undefined,
  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Retry a test if its failing with enabled tracing. This allows you to analyse the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: 'retry-with-trace',

    // All available context options: https://playwright.dev/docs/api/class-browser#browser-new-context
    // contextOptions: {
    //   ignoreHTTPSErrors: true,
    // },
    storageState: 'storageState.json',
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      name: 'Desktop Chromium',
      use: {
        ...devices['Desktop Chromium'],
      },
    },
  ],
}

export default config
