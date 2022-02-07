# Newspack e2e

## Requirements

`node`, `npm`, `docker`, `docker-compose` installed.

## How to

1. Start docker-compose: `$ docker-compose up`
1. In a new terminal session, run setup script in the container: `$ npm run wp:setup`
1. Start Cypress:
  - no UI, run headless - `$ npm run test:ci`
  - with Cypress UI - `$ npm run test`

### Resetting the data

Run `$ npm run wp:reset` to reset the WP DB.

Run `$ npm run wp:reset:plugins` to reset the WP DB and remove all plugins.

For a real hard reset, stop the `docker-compose` process, remove containers (`docker-compose down --volumes`), and repeat the initial setup form above.

### Running tests agains local plugin version

1. Remove the `./wordpress/wp-content/plugins/newspack-plugin`
1. Sync the local content to the Docker container volume: `$ rsync -a --exclude-from='.distignore' . /path/to/newspack-e2e-tests/wordpress/wp-content/plugins/newspack-plugin`

### Visual regression testing

After adding a new visual regression test, run `$ npm run test:visual:setup` to create the base images.

To check for visual regressions, run `$ npm run test:visual:check`.

The images are stored in `cypress/snapshots/base`. After a test run, the image diffs will be stored in `cypress/snapshots/diff` - in case of tests failing on visual check, inspect those for the regressions.

The visual regression testing is set up to run in Electron browser in order to achieve same results locally and on CI (where Electron is the only available option).

_Note that Cypress UI will disappear momentarily when taking a screenshot._

## Debugging

- After each test run, a video of the test will be stored in `artifacts/video`
- Enter the WordPress docker container with `docker exec -it wordpress_local /bin/bash` - the WP CLI will be installed.
  - all `wp` commands have to be ran with `--allow-root` option
- WP is available locally at `http://localhost:8000`
