
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

  // Add a small wait to ensure dialog handling completes.
  await page.waitForTimeout(1000);
  // And wait for the page to load after the snapshot is loaded. We should be logged out and on the login page.
  await page.waitForSelector('label:text("Username or Email Address")');

  console.log(`Done loading snapshot: ${snapshotName}`);
  return true;
};