# Newspack e2e

## Requirements

`node`, `npm`, `docker`, `docker-compose` installed.

## How to

1. start docker-compose: `$ docker-compose up`
1. wait for `Complete! WordPress has been successfully copied to /var/www/html` message from `wordpress_local` container in the logs
1. in a new terminal session, run setup script in the container: `$ npm run wp:setup`
1. start Cypress:
  - no UI, run headless - `$ npm run test:ci`
  - with Cypress UI - `$ npm run test`

### Resetting the data

Run `$ npm run wp:reset` to reset the WP DB.

Run `$ npm run wp:reset:plugins` to reset the WP DB and remove all plugins.

For a real hard reset, stop the `docker-compose` process, remove containers (`docker-compose down --volumes`), and repeat the initial setup form above.

### Visual regression testing

After adding a new visual regression test, run `$ npm run test:visual:setup` to create the base images.

To check for visual regressions, run `$ npm run test:visual:check`.

The images are stored in `cypress/snapshots/base`. After a test run, the image diffs will be stored in `cypress/snapshots/diff` - in case of tests failing on visual check, inspect those for the regressions.

_Note that Cypress UI will disappear momentarily when taking a screenshot._

## Debugging

- After each test run, a video of the test will be stored in `artifacts/video`
- Enter the WordPress docker container with `docker exec -it wordpress_local /bin/bash` - the WP CLI will be installed.
- You can always visit `http://localhost:8000`
