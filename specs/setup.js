describe("Setup Newspack plugin", () => {
  it("Log in to admin", () => {
    cy.wpLogin();
  });

  it("Go to Newspack page", () => {
    cy.clickAdminMenu("Newspack");

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
  });

  it("Fill newsroom data", () => {
    cy.assertURLIncludes("/newsroom");
    cy.contains("Tell us about your Newsroom");

    cy.waitForNewspackWizardLoad();

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

  it("Theme selection", () => {
    cy.visitWPURL(
      "/wp-admin/admin.php?page=newspack-setup-wizard#/theme-style-selection"
    );
    cy.waitForNewspackWizardLoad();
    cy.contains("Theme");

    // force, because the button is hidden - it shows on hover
    cy.contains("button", "Activate").click({ force: true });
    cy.wait(1000);
    cy.waitForNewspackWizardLoad();

    cy.contains("Continue").click();
  });

  it("Install starter content", () => {
    cy.assertURLIncludes("starter-content");
    cy.waitForNewspackWizardLoad();
    cy.contains("Install Starter Content").click({ force: true });

    // wait for button to become disabled
    cy.wait(2000);

    cy.waitUntil(
      () =>
        Cypress.$(`button:contains("Install Starter Content")[disabled]`)
          .length === 0,
      {
        errorMsg: "Timout exceeded when waiting for starter content.",
        // wait for 2mns max
        timeout: 2 * 60000,
        interval: 2000
      }
    );
  });

  it("Redirected to dashboard", () => {
    cy.assertURLIncludes("?page=newspack");
  });
});
