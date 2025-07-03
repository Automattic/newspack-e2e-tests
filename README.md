# Newspack end-to-end testing

🎥 See the latest test report at https://automattic.github.io/newspack-e2e-tests.

## Setup

### Local setup & testing

Will need a local test site – set it up with [`newspack-docker`](https://github.com/Automattic/newspack-docker) by running `n sites-add e2e`. This will create a local `https://e2e.local` site.

Then, follow the "Setting up a test site" instructions from this doc.

1. One-time setup (unless the files mentioned below are updated)
   - create an `.env` file (see `.env-sample`).
   - copy `e2e-reset.sh` to the site's html folder and run it in the docker container. 
   - put `e2e-plugin.php` in the test site's plugins directory
   - set up payments - see "Payments" section below
2. Testing
   - run `npm t` for a single test run
   - run `npm run test:ui` for a test run with UI
   - run `npm run codegen -- <site-url>` for a test code generation UI
   - run the `e2e-reset.sh` script in the docker container to clean up after a test run

### CI testing

Will need a publicly accessible (or at least accessible for the CI server) test site, running on a platform which accepts password-only SSH authentication.

[The credentials for the Atomic site currently used for the e2e testing.](https://mc.a8c.com/secret-store/?secret_id=12168)

1. Define all variables listed in `.env-sample` in the CircleCI project settings
2. Also define the following:
   1. `SSH_USER` - simply a username string, e.g. `newspack-user`
   2. `SSH_HOST` - hostname of the platform, e.g. `ssh.myplatform.net`
   3. `SSH_USER_PASS` - SSH password
   4. `SSH_KNOWN_HOST` - this you can get by connecting to the platform and copying the line added to the `/root/.ssh/known_hosts` file
   5. `GITHUB_COMMITER_EMAIL`, `GIT_COMMITTER_NAME`, `GITHUB_TOKEN` – for GH pages deployment
   6. `SLACK_AUTH_TOKEN`, `SLACK_CHANNEL_ID` – for Slack notifications
3. Set up payments - see "Payments" section below

### Payments

1. Configure the Stripe gateway to use the WC Connect Stripe gateway version (*not* the "Legacy checkout experience").
1. Make sure Stripe "Link by Stripe" express checkout (in "Payment Methods") is disabled

## Snapshot switching
With `npm run test:snapshots` the test runner will switch between two snapshots: a vanilla Newspack site and a Newspack site with WooCommerce. The test site needs to have twp snapshots available: `vanilla` and `with-woo`. [See snapshot docs](https://github.com/automattic/newspack-manager?tab=readme-ov-file#site-testing-snapshots) for more details on how to set up snapshots.

Because tests can't run in any order when testing both snapshots, the test runner will run all tests in order. The dependencies in the `playwright.config.ts` file are a bit complicated, but the order is as follows:
```
USE_SNAPSHOTS is TRUE (with workers: 1):

🔧 SETUP PHASE
┌─────────────────┐
│  setup-vanilla  │  (switches to vanilla snapshot)
└─────────┬───────┘
          │
🧪 VANILLA TESTS PHASE
          ▼
┌─────────────────┐
│ Vanilla Desktop │  (@vanilla tests)
│     Chrome      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Vanilla Mobile  │  (@vanilla tests) 
│     Chrome      │  ← LAST @vanilla test
└─────────┬───────┘
          │
🔧 WOO SETUP PHASE
          ▼
┌─────────────────┐
│ setup-with-woo  │  (switches to Woo snapshot)
└─────────┬───────┘
          │
🧪 WOO TESTS PHASE
          ▼
┌─────────────────┐
│ With Woo Desktop│  (@with-woo tests. Depends on setup-with-woo that in turn depends on Vanilla in Mobile Chrome to finish)
│     Chrome      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ With Woo Mobile │  (@with-woo tests)
│     Chrome      │
└─────────────────┘
```

If you want to exclude media from snapshots (and that is proabably a good idea for e2e testing), set the `NP_MANAGER_SNAPSHOTS_EXCLUDE_MEDIA` constant to true.

## Writing tests

Tests can be written by hand in the `tests` directory, or with the help of Playwright codegen. To use the latter option, run `npm run codegen -- <site-url>`. When you're done, copy and paste the code to `tests/<test-name>.spec.js`, adjust, and submit the changes in a PR.

If the tests manipulate any persistent items (anything in the DB), reset commands should be added to the `/bin/e2e-reset.sh` script. In the future, if that's too brittle, we might opt for a full reset, though.

## Resetting the test site
The test site can be reset by running the `e2e-reset.sh` script. Please note that on initial setup of the site, you will need to set up the Stripe test connection manually or put this in an `.env` file in the same dir as the `e2e-reset.sh`:
```
STRIPE_PUB_KEY=<the-pub-key>
STRIPE_SECRECT_KEY=<tha-secret-key>
```
