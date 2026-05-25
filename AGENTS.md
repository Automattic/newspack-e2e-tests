# newspack-e2e-tests – agent notes

Playwright end-to-end suite for Newspack. CI (TeamCity) runs it against
`https://e2e.newspackstaging.com`. It can also run against a local isolated env.

## How to run

```sh
# Local env (default; targets SITE_URL from .env, usually https://e2e-release.local):
USE_SNAPSHOTS=true npm run test:snapshots

# A single project (skips the rest):
USE_SNAPSHOTS=true npx playwright test --project="Vanilla in Desktop Chrome"

# Against staging – override SITE_URL and ADMIN_PASSWORD inline:
SITE_URL="https://e2e.newspackstaging.com" ADMIN_PASSWORD="<staging-pw>" \
  USE_SNAPSHOTS=true npx playwright test --project="With Woo in Desktop Chrome"
```

- Projects: `setup-vanilla` and `setup-with-woo` load snapshots; the four
  `Vanilla/With Woo in Desktop/Mobile Chrome` projects depend on them (so running
  a spec project pulls in its setup).
- The local env runs in the docker container `newspack_env_e2e_release`
  (`docker exec newspack_env_e2e_release wp --allow-root ...`).
- `e2e-reset.sh` provisions a site from scratch and (re)creates the snapshots. You
  rarely need it – snapshots are the normal reset mechanism. It is written for the
  local `--allow-root` docker env, not staging.

## Snapshot model (read this before touching credentials or "missing snapshot" errors)

Snapshots are filesystem DB dumps under `get_temp_dir()/np-snapshots/<slug>/`
(`db.sql.gz` + `metadata.json`), managed by the `newspack-manager` plugin
(`includes/site-testing-snapshots/`). `loadSnapshot` (`tests/utils-admin.ts`)
drives the admin UI at `tools.php?page=newspack-snapshots`.

- **Loading a snapshot replaces the entire DB**, including `wp_users` – so the
  admin password becomes the one captured when the snapshot was created.
  Therefore `ADMIN_PASSWORD` must match the snapshot's admin password.
  - `.env`'s `ADMIN_PASSWORD=password` is for the **local** env only.
  - Staging's admin password lives in the a8c secret store (README → `secret_id=12168`)
    and matches what's baked into the staging snapshots.
  - Do **not** `wp user update --user_pass` to fix a login failure – the snapshot
    is the source of truth; you'd just desync it. Running the suite twice with the
    wrong password fails the second time at `logIn`'s `waitForURL(/\/wp-admin/)`
    (the first load swaps in the snapshot's password).

- **WP-version coupling.** A snapshot's dump carries the `db_version` of the core
  it was created on. After a WP core bump, loading an older snapshot rolls
  `db_version` back below the running core; `wp-admin/admin.php` then redirects
  every admin request to `upgrade.php` (this check runs *before* `auth_redirect()`).
  That makes the snapshots page appear empty and surfaces as
  `FATAL: Snapshot "<slug>" not found` – even though the files are fine and WP-CLI
  lists them (CLI ignores the redirect). `loadSnapshot` handles this by calling
  `ensureDatabaseUpgraded()` (hits `upgrade.php?step=1`, a no-op when current)
  before login and after each load. So "snapshot not found" usually means a
  *pending DB upgrade*, not deleted files – check `db_version` vs core's
  `$wp_db_version` first.

## Reproducing the CI environment locally

To simulate an older-schema snapshot on a current-core local env, lower the
`db_version` baked into a snapshot's dump:

```sh
docker exec newspack_env_e2e_release bash -c '
  cd /tmp/np-snapshots
  zcat vanilla/db.sql.gz | perl -pe "s/('\''db_version'\''\s*,\s*)'\''<NEW>'\''/\${1}'\''<OLD>'\''/g" \
    | gzip > vanilla/db.sql.gz.new && mv vanilla/db.sql.gz.new vanilla/db.sql.gz'
```

(Back up the dump dir first; restore it after.) Loading it then reproduces the
post-core-bump `upgrade.php` redirect.
