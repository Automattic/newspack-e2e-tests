describe("Set up Newspack plugin", () => {
  it("Log in to admin", () => {
    cy.visit("http://localhost:8000/wp-admin");
    cy.wpLogin();
  });

  it("Go to Newspack page", () => {
    cy.get("#adminmenu")
      .contains("Newspack")
      .click();

    cy.assertURLIncludes("/wp-admin/admin.php?page=newspack-setup-wizard");
    cy.wpDismissPointers();

    cy.contains("Welcome to WordPress for your Newsroom");

    cy.contains("Get started").click();
    cy.assertURLIncludes("/about");
  });

  it("Fill publication data", () => {
    cy.contains("About your publication");

    cy.selectOption("Where is your business based?", "PT", "Portugal");
    cy.fillInput("Address", "42nd Street");
    cy.fillInput("Address line 2", "apt. 21");
    cy.fillInput("City", "Lisbon");
    cy.fillInput("Postcode/Zip", "00555");
    cy.selectOption("Currency", "EUR", "Euro");

    cy.compareVisualRegressionScreenshot(
      "#newspack-setup-wizard",
      "wizard-after-about"
    );

    cy.contains("Continue").click();
    cy.assertURLIncludes("/newsroom");
  });

  it("Fill newsroom data", () => {
    cy.contains("Tell us about your Newsroom");

    cy.selectOption("Size of your newsroom", "4-10");
    cy.selectOption("Your publishing medium", "both", "Digital and Print");
    cy.selectOption("Size of your audience", "10000-100000");
    cy.selectOption("Content focus", "local", "Local News");
    cy.selectOption("Average number of stories published monthly", "50-100");
    cy.selectOption("Monthly unique visitors", "1000-10000");
    cy.contains("Newsletters").click();

    cy.compareVisualRegressionScreenshot(
      "#newspack-setup-wizard",
      "wizard-after-newsroom-data"
    );

    cy.contains("Continue").click();
  });
});
