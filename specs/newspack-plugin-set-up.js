describe("Set up Newspack plugin", () => {
  it("Log in to admin", () => {
    cy.wpLogin();
  });

  it("Go to Newspack page", () => {
    cy.get("#adminmenu").contains("Newspack").click();

    cy.assertURLIncludes("/wp-admin/admin.php?page=newspack-setup-wizard");
    cy.wpDismissPointers();

    cy.contains("Welcome to Newspack");
  });
});
