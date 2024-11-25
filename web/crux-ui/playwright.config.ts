// eslint-disable-next-line import/no-extraneous-dependencies
import { devices, PlaywrightTestConfig } from '@playwright/test'
// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:8000'
export const STORAGE_STATE = path.join(__dirname, 'storageState.json')

const DEBUG = !!process.env.DEBUG || !!process.env.PWDEBUG
const CI = !!process.env.CI

const createProject = (name: string, testMatch: string | RegExp | (string | RegExp)[], deps?: string[]) => ({
  name,
  testMatch,
  // If running in DEBUG mode only depend on 'global-setup' so any test can run without running the whole project structure
  dependencies: DEBUG ? ['global-setup'] : deps ?? ['global-setup'],
  use: {
    ...devices['Desktop Chromium'],
    storageState: STORAGE_STATE,
  },
})

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  timeout: 2 * 60 * 1000, // 2 mins
  expect: { timeout: 10 * 1000 }, // We double the default(5s), since some test runners are not THAT fast :)
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: path.join(__dirname, 'e2e_results/'),
  testDir: path.join(__dirname, 'e2e'),
  webServer: {
    command: '>&2 echo "this should never happen, running UI is expected"',
    url: BASE_URL,
    timeout: 60 * 1000, // 1 min
    reuseExistingServer: true,
  },
  workers: CI ? 4 : 32, // 4 threads during the pipeline run, 32 by default
  maxFailures: 1, // Terminate tests if any one of them fails
  retries: 0,
  reporter: CI ? 'github' : 'list',
  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL: BASE_URL,

    trace: {
      // Retry a test if its failing with enabled tracing. This allows you to analyse the DOM, console logs, network traffic etc.
      // More information: https://playwright.dev/docs/trace-viewer
      mode: 'retain-on-failure',
      snapshots: true,
      screenshots: true,
    },

    // All available context options: https://playwright.dev/docs/api/class-browser#browser-new-context
    // contextOptions: {
    //   ignoreHTTPSErrors: true,
    // },
    viewport: { width: 1920, height: 1080 },

    // Advanced low level timeouts for faster test failure
    // https://playwright.dev/docs/test-timeouts#advanced-low-level-timeouts
    actionTimeout: 30 * 1000, // 30 seconds
    navigationTimeout: 30 * 1000, // 30 seconds
  },
  projects: [
    {
      name: 'global-setup',
      testMatch: /global\.setup\.spec\.ts/,
      teardown: 'global-teardown',
      use: {
        ...devices['Desktop Chromium'],
      },
    },
    {
      name: 'global-teardown',
      testMatch: /global\.teardown\.spec\.ts/,
      use: {
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'without-login',
      testMatch: /without-login\/.*spec\.ts/,
      use: {
        ...devices['Desktop Chromium'],
      },
    },
    createProject('registry', 'with-login/registry.spec.ts'),
    createProject('notification', 'with-login/notification.spec.ts'),
    createProject('nodes', 'with-login/nodes.spec.ts'),
    createProject('template', 'with-login/template.spec.ts'),
    createProject('project', 'with-login/project.spec.ts'),
    createProject('version', 'with-login/version.spec.ts'),
    createProject('image-config', /with-login\/image-config\/(.*)/, ['registry', 'template', 'version']),
    createProject('deployment', /with-login\/deployment(.*)\.spec\.ts/, ['image-config', 'nodes']),
    createProject('dagent-deploy', 'with-login/nodes-deploy.spec.ts', ['deployment']),
    createProject('resource-copy', 'with-login/resource-copy.spec.ts', ['template', 'version', 'deployment', 'nodes']),
    createProject('dashboard', 'with-login/dashboard.spec.ts'),
    createProject('team', 'with-login/team.spec.ts'),
    createProject('storage', 'with-login/storage.spec.ts'),
    createProject('config-bundle', 'with-login/config-bundle.spec.ts'),
  ],
}

export default config
