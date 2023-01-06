# Newspack e2e

## Requirements

`node`, `npm`, `docker`, `docker-compose` installed.

## Running the tests locally

1. Create a `scripts/.secrets` file, based on `secrets/.secrets-sample`
1. Add `newspack-e2e.com` to hosts file (add a line with `127.0.0.1 newspack-e2e.com`)
1. Start docker-compose: `$ docker-compose up --build`
1. In a new terminal session, run setup script in the container: `$ npm run wp:setup`
1. Start Cypress:
  - no UI, run headless - `$ npm run test:ci`
  - with Cypress UI - `$ npm run test`

### Resetting the data

Run `$ npm run wp:reset` to reset the WP DB and re-run setup script.

For a real hard reset, stop the `docker-compose` process, remove containers (`docker-compose down --volumes`), and repeat the initial setup form above.

### Running tests against a local plugin version

1. Remove the `./wordpress/wp-content/plugins/newspack-plugin`
1. Sync the local content to the Docker container volume: `$ rsync -a --exclude-from='.distignore' . /path/to/newspack-e2e-tests/wordpress/wp-content/plugins/newspack-plugin`

_Pro tip: use [chokidar](https://www.npmjs.com/package/chokidar) to sync local repository to the Docker machine, by running this in the plugin folder:_

```
$ chokidar "." -c "rsync -a --exclude-from='.distignore' . /path/to/newspack-e2e-tests/wordpress/wp-content/plugins/newspack-plugin"
```

## Testing channels

There are three "testing channels" available, meaning three sources for the Newspack plugins:

1. Stable releases channel – versions currently distributed on Github
1. `master` branches channel – versions built from `master` branches
1. `alpha` branches channel – versions currently distributed on Github as pre-releases

The CI for this project should be configured to run tests periodically – after release days for the stable & `alpha` channels, and daily for `master` branches channel.

The stable channel is the default. To use a different channel while developing tests locally, add `TEST_CHANNEL` variable in `scripts/.env`.

## Visual regression testing

_Not ready yet for running on CI. Due to font differences the results fail._

After adding a new visual regression test, run `$ npm run test:visual:setup` to create the base images.

To check for visual regressions, run `$ npm run test:visual:check`.

The images are stored in `cypress/snapshots/base`. After a test run, the image diffs will be stored in `cypress/snapshots/diff` - in case of tests failing on visual check, inspect those for the regressions.

The visual regression testing is set up to run in Electron browser in order to achieve same results locally and on CI (where Electron is the only available option).

_Note that Cypress UI will disappear momentarily when taking a screenshot._

## Debugging

- After each test run, a video of the test will be stored in `artifacts/video`
- Enter the WordPress docker container with `docker exec -it wordpress_local /bin/bash` - the WP CLI will be installed.
  - all `wp` commands have to be ran with `--allow-root` option
- WP is available locally at `https://newspack-e2e.com`

## Slack notifications

If `SLACK_CHANNEL_ID` and `SLACK_AUTH_TOKEN` environment variables are set on the CI environment, the selected Slack channel will be updated whenever a test suite fails.
