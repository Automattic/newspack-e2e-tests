// Dismiss small popups that obscure admin UI
// e.g. AMP plugin add one about AMP Stories
Cypress.Commands.add("wpDismissPointers", () => {
  if (Cypress.$(".wp-pointer").length > 0) {
    cy.get(".wp-pointer .close").click();
  }
});

// Dismiss block editor intro.
Cypress.Commands.add("wpDismissBlockEditorIntro", () => {
  const selector = '[aria-label="Welcome to the block editor"]';
  cy.get(selector)
    .get('[aria-label="Close"]')
    .click();
});

Cypress.Commands.add("wpLogin", () => {
  cy.visitWPURL("/wp-login.php");

  // Cypress sometimes lost focus on the input when the page was
  // still loading, waiting here for a sec seems to fix that.
  cy.wait(1000);

  cy.get("input[name=log]")
    .clear()
    .type("admin")
    .should("have.value", "admin");

  cy.get("input[name=pwd]")
    .clear()
    .type("password")
    .should("have.value", "password");

  cy.contains("Log In").click();
});

Cypress.Commands.add("visitWPURL", route => {
  cy.visit(route);
});

Cypress.Commands.add("wpPublishPost", (type = "Post") => {
  cy.contains("Publish").click();
  cy.get(".editor-post-publish-panel")
    .contains("Publish")
    .click();
  cy.contains(`${type} published`, { timeout: 60000 });
});
