Cypress.Commands.add("visitNewspackWizard", (wizardTitle) => {
  cy.wpLogin();
  cy.get("#adminmenu").contains("Newspack").click();
  cy.contains(wizardTitle).click();

  // Wizard title.
  cy.get("h1").contains(wizardTitle);
});
