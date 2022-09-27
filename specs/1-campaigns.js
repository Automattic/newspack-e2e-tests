describe("Campaigns", () => {
  const welcomePromptContent = "Welcome to our site!";
  const oneTimePromptContent = "Only once!";

  it("Visit the Campaigns wizard", () => {
    cy.visitNewspackWizard("Campaigns");
  });

  it("Create a simple inline prompt", () => {
    cy.contains("Add New Prompt").click();
    // New prompt modal title.
    cy.get("h1").contains("Add New Prompt");
    cy.contains("Inline").click();

    cy.wpDismissBlockEditorIntro();

    cy.get('[aria-label="Add title"]').type("Welcome prompt");
    cy.get('[aria-label="Add default block"]')
      .first()
      .type(welcomePromptContent);

    // Set the prompt to display at 0% depth.
    cy.contains("button", "Prompt").click();
    cy.contains("button", "Settings").click();
    cy.get(
      'input[type="number"][aria-label="Approximate Position (in percent)"]'
    )
      .clear()
      .type("0", { force: true });

    // Display on posts only.
    cy.contains("button", "Post Types").click();
    cy.uncheckInput("Pages");

    cy.wpPublishPost();
  });

  it("Create a one-time prompt", () => {
    cy.visitNewspackWizard("Campaigns", { direct: true });
    cy.contains("Add New Prompt").click();
    cy.contains("Center Overlay").click();

    cy.wpDismissBlockEditorIntro();

    cy.get('[aria-label="Add title"]').type("One-time prompt");
    cy.get('[aria-label="Add default block"]')
      .first()
      .type(oneTimePromptContent);
    // Set the prompt to display only once.
    cy.contains("button", "Prompt").click();
    cy.contains("button", "Frequency").click();
    cy.selectOption("Frequency", "once");

    cy.wpPublishPost();

    cy.contains("Log Out").click({ force: true });
  });

  it("Visit site as a non-logged-in user and observe the prompt in an article", () => {
    cy.visitWPURL("/");

    cy.contains(oneTimePromptContent, { timeout: 120000 }).should("be.visible");
    cy.get('[aria-label="Close Pop-up"]').click();

    // Expect not to see the inline prompt on the homepage.
    cy.contains(welcomePromptContent).should("not.exist");

    cy.get(".entry-title a").first().click();

    cy.contains(oneTimePromptContent, { timeout: 120000 }).should(
      "not.be.visible"
    );
    cy.contains(welcomePromptContent, { timeout: 120000 }).should("be.visible");
  });
});
