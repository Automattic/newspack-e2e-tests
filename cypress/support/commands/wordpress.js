const getSiteUrl = () => {
  const NGROK_SUBDOMAIN = Cypress.env("NGROK_SUBDOMAIN");
  if (NGROK_SUBDOMAIN) {
    return `http://${NGROK_SUBDOMAIN}.ngrok.io`;
  } else {
    return `http://localhost:8000`;
  }
};

// Dismiss small popups that obscure admin UI
// e.g. AMP plugin add one about AMP Stories
Cypress.Commands.add("wpDismissPointers", value => {
  if (Cypress.$(".wp-pointer").length > 0) {
    cy.get(".wp-pointer .close").click();
  }
});

Cypress.Commands.add("visitWPURL", route => {
  cy.visit(`${getSiteUrl()}${route || ""}`);
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

Cypress.Commands.add("wpLogout", () => {
  cy.contains("a", "Log Out").click({ force: true });
});

Cypress.Commands.add("clickAdminMenu", name => {
  cy.get("#adminmenu")
    .contains(name)
    .click();
});
