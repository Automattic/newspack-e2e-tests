// Dismiss small popups that obscure admin UI
// e.g. AMP plugin add one about AMP Stories
Cypress.Commands.add("wpDismissPointers", value => {
  if (Cypress.$(".wp-pointer").length > 0) {
    cy.get(".wp-pointer .close").click();
  }
});

Cypress.Commands.add("wpLogin", () => {
  cy.get("#user_login")
    .type("admin")
    .should("have.value", "admin");
  cy.get("#user_pass")
    .type("password")
    .should("have.value", "password");
  cy.contains("Log In").click();
});
