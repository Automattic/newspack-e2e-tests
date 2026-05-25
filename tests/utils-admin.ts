
// Return the locator scope for the block editor content. Gutenberg iframes the
// editor canvas in some configurations (block themes, newer Gutenberg) but not
// others (the classic newspack-theme renders blocks at the top level), so
// detect it and fall back to the page when there's no canvas iframe.
export const getEditorCanvas = async (page) => {
  // Wait for the editor root to exist. Use "attached" rather than the default
  // "visible": on a mobile viewport #editor is a wrapper that doesn't pass the
  // visibility check even though the editor has loaded.
  await page.locator("#editor").waitFor({ state: "attached" });
  // The canvas iframe (block themes / newer Gutenberg) mounts asynchronously;
  // give it a brief chance to appear before falling back to the page.
  const isIframed = await page
    .locator('iframe[name="editor-canvas"]')
    .waitFor({ state: "attached", timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  return isIframed ? page.frameLocator('iframe[name="editor-canvas"]') : page;
};

// Log in to the admin dashboard.
export const logIn = async (page) => {
  await page.goto("/wp-login.php");
  await page.waitForTimeout(500); // Prevent a weird issue where the inputs are cleared after clicking the button.
  await page.getByLabel("Username or Email Address").click();
  await page
    .getByLabel("Username or Email Address")
    .fill(process.env.ADMIN_USER);
  await page.getByLabel("Password", { exact: true }).click();
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL(/\/wp-admin/);
};

export const logOut = async (page) => {
  await page.goto("/?action=logout_without_nonce");
};

export const isMobileAdmin = async (page) => {
  return await page.getByRole("menuitem", { name: "Menu" }).isVisible();
};

export const goToAdminMenu = async (menuItem, submenuItem, page) => {
  await page.goto("/wp-admin");
  const isMobile = await isMobileAdmin(page);
  if (isMobile) {
    await page.getByRole("menuitem", { name: "Menu" }).click();
  }
  await page
    .getByLabel("Main menu", { exact: true })
    .getByRole("link", { name: menuItem })
    .click();
  await page.getByRole("link", { name: submenuItem, exact: true }).click();
};

// Load a snapshot by its slug using the admin interface.
export const loadSnapshot = async (page, snapshotName: string) => {
  console.log(`Setting up snapshot: ${snapshotName}`);

  // Clear any pending DB upgrade before we start. If the site's core was
  // updated without the schema upgrade running (e.g. after a WP major bump),
  // wp-admin redirects everything to upgrade.php and the snapshots page would
  // appear empty. Running it before login also avoids logging ourselves out,
  // since the upgrade invalidates existing sessions.
  await ensureDatabaseUpgraded(page);

  await logIn(page);
  await page.goto('/wp-admin/tools.php?page=newspack-snapshots');

  const row = page.getByRole('row').filter({
    has: page.getByRole('cell', {name: snapshotName, exact: true})
  });

  // Make sure a snapshot with that name is even found and error hard if not.
  const count = await row.count();
  if (count === 0) {
    throw new Error(`FATAL: Snapshot "${snapshotName}" not found in the table of available snapshots. Cannot continue tests.`);
  }

  console.log(`Found the snapshot: ${snapshotName}. Now loading it...`);

  page.on('dialog', dialog => {
    dialog.accept();
  });

  const loadLink = row.locator('a[href*="np_snapshot_load_link"]');
  await loadLink.waitFor({state: 'visible'});
  await loadLink.click();

  // Loading the snapshot replaces the DB with the dump captured when the
  // snapshot was created, which invalidates the current session. Where we land
  // next depends on the snapshot's age:
  //  - if its schema matches the running core, WordPress logs us out and we end
  //    on the login page;
  //  - if the snapshot predates the current core (older db_version), the DB
  //    version check in wp-admin/admin.php runs before auth and redirects every
  //    wp-admin request to upgrade.php instead.
  // Wait for either outcome to confirm the load (and its redirect chain) is done.
  await page.waitForURL(/wp-login\.php|upgrade\.php/, {timeout: 60000});

  // Clear any pending DB upgrade the restored dump introduced, so the freshly
  // loaded site is reachable for the tests that follow.
  await ensureDatabaseUpgraded(page);

  console.log(`Done loading snapshot: ${snapshotName}`);
  return true;
};

// Run WordPress' database schema upgrade if one is pending.
//
// A snapshot is dumped at the core version it was created on, so loading one
// can roll `db_version` back below the running core's. WordPress then flags a
// pending upgrade and redirects every wp-admin request to upgrade.php until the
// upgrade runs. `upgrade.php?step=1` runs it directly: it needs no auth or
// nonce (it is meant to run mid-upgrade, before login) and is a no-op
// ("already up to date") when nothing is pending, so it is always safe to call.
export const ensureDatabaseUpgraded = async (page) => {
  await page.goto('/wp-admin/upgrade.php?step=1');
  await page.waitForLoadState('domcontentloaded');
};