describe("Campaigns", () => {
  const promptContent = "Welcome to our site!";
  it("Visit the Campaigns wizard", () => {
    cy.wpLogin();
    cy.get("#adminmenu").contains("Newspack").click();
    cy.contains("Campaigns").click();

    // Wizard title.
    cy.get("h1").contains("Campaigns");
  });

  it("Create a new prompt", () => {
    cy.get('[aria-label="Add New Prompt"]').click();
    // New prompt modal title.
    cy.get("h1").contains("Add New Prompt");
    cy.contains(".title", "Inline").click();

    cy.wpDismissBlockEditorIntro();

    cy.get('[aria-label="Add title"]').type("Welcome prompt");
    cy.get('[aria-label="Add block"]').first().type(promptContent);

    // Set the prompt to display at 0% depth.
    cy.contains("button", "Prompt").click();
    cy.contains("button", "Prompt Settings").click();
    cy.get(
      'input[type="number"][aria-label="Approximate Position (in percent)"]'
    )
      .clear()
      .type("0", { force: true });

    cy.contains("Publish").click();
    cy.get(".editor-post-publish-panel").contains("Publish").click();
    cy.contains("Post published");
    cy.contains("Log Out").click({ force: true });
  });

  it("Visit site as a non-logged-in user and observe the prompt in an article", () => {
    cy.visitWPURL("/");

    cy.get(".entry-title a").first().click();

    cy.intercept("GET", /newspack/).as("campaignsAPI");
    cy.wait("@campaignsAPI").then((req) => cy.log(req.response.body));

    cy.get("amp-analytics").then((el) => cy.log(el.get(0).innerHTML));

    cy.get(".newspack-popup")
      .contains(promptContent, { timeout: 120000 })
      .should("be.visible");

    cy.wait(3);
  });
});
