import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require("dotenv").config();

// Add a delay on CI, so the video recordings are more readable.
const launchOptions = process.env.CI
  ? {
      slowMo: 1000,
    }
  : {};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests. */
  workers: 1,
  fullyParallel: false,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.SITE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    video: "on",
  },
  timeout: 120000,
  expect: { timeout: 120000 },
  /* Note that projects depend on each other if we are using snapshots. Vanilla needs to run first and then with Woo.  */
  projects: [
    // These two projects are used to set up the environment for the tests.
    {
      name: 'setup-vanilla',
      testMatch: 'vanilla.ts',
      testDir: './setup',
    },
    {
      name: 'setup-with-woo',
      testMatch: 'with-woo.ts',
      testDir: './setup',
      dependencies: process.env.USE_SNAPSHOTS ? ['Vanilla in Mobile Chrome'] : []
    },

    // Vanilla tests.
    {
      name: 'Vanilla in Desktop Chrome',
        use: {
          ...devices["Desktop Chrome"],
          launchOptions,
        },
        grep: /@vanilla/,
      dependencies: process.env.USE_SNAPSHOTS ? ['setup-vanilla'] : []
    },
    {
      name: "Vanilla in Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        launchOptions
      },
      grep: /@vanilla/,
      dependencies: process.env.USE_SNAPSHOTS ? ['Vanilla in Desktop Chrome'] : []
    },

    // All tests (will also include Vanilla tests).
    {
      name: 'With Woo in Desktop Chrome',
      use: {
        ...devices["Desktop Chrome"],
        launchOptions,
      },
      grep: /@with-woo/,
      dependencies: process.env.USE_SNAPSHOTS ? ['setup-with-woo'] : []
    },
    {
      name: "With Woo in Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        launchOptions
      },
      grep: /@with-woo/,
      dependencies: process.env.USE_SNAPSHOTS ? ['With Woo in Desktop Chrome'] : []
    },
  ],
});
