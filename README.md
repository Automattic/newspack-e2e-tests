# Newspack end-to-end testing

Is run with Playwright.

## Setting up a test site (CI or local)

1. On the test site, install and activate `newspack-plugin` and run `wp newspack setup`.
2. Install and activate also `woocommerce-gateway-stripe` and `woocommerce-subscriptions` plugins.
3. Configure the Stripe gateway to use the WC Connect Stripe gateway version (*not* the "Legacy checkout experience").

## Local setup & testing

Will need a local test site – set it up with [`newspack-docker`](https://github.com/Automattic/newspack-docker) by running `n sites-add e2e`. This will create a local `https://e2e.local` site.

Then, follow the "Setting up a test site" instructions from this doc.

1. One-time setup (unless the files mentioned below are updated)
   - Create an `.env` file (see `.env-sample`).
   - run `e2e-reset.sh` in the docker container
   - put `e2e-plugin.php` in the test site's plugins directory
2. Testing
   - run `npm t` for a single test run
   - run `npm run test:ui` for a test run with UI
   - run `npm run codegen -- <site-url>` for a test code generation UI

## CI testing

Will need a publicly accessible (or at least accessible for the CI server) test site, running on a platform which accepts password-only SSH authentication.

[The credentials for the Atomic site currently used for the e2e testing.](https://mc.a8c.com/secret-store/?secret_id=12168)

1. Define all variables listed in `.env-sample` in the CircleCI project settings
1. Also define the following:
   1. `SSH_USER` - simply a username string, e.g. `newspack-user`
   2. `SSH_HOST` - hostname of the platform, e.g. `ssh.myplatform.net`
   3. `SSH_USER_PASS` - SSH password
   4. `SSH_KNOWN_HOST` - this you can get by connecting to the platform and copying the line added to the `/root/.ssh/known_hosts` file
   5. `GITHUB_COMMITER_EMAIL`, `GIT_COMMITTER_NAME`, `GITHUB_TOKEN` – for GH pages deployment
   6. `SLACK_AUTH_TOKEN`, `SLACK_CHANNEL_ID` – for Slack notifications

2. Follow the "Setting up a test site" instructions from this doc.

## Writing tests

Tests can be written by hand in the `tests` directory, or with the help of Playwright codegen. To use the latter option, run `npm run codegen -- <site-url>`. When you're done, copy and paste the code to `tests/<test-name>.spec.js`, adjust, and submit the changes in a PR.

If the tests manipulate any persistent items (anything in the DB), reset commands should be added to the `/bin/e2e-reset.sh` script. In the future, if that's too brittle, we might opt for a full reset, though.
