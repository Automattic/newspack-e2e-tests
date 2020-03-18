import "./wordpress";
import "./visual-regression";

Cypress.Commands.add("selectOption", (label, value, expected) => {
  cy.contains(label)
    .siblings("select")
    .select(value);

  expected && cy.contains(expected);
});

Cypress.Commands.add("fillInput", (label, value) => {
  cy.contains(label)
    .siblings("input")
    .type(value)
    .should("have.value", value);
});

Cypress.Commands.add("assertURLIncludes", value => {
  cy.url().should("include", value);
});

Cypress.Commands.add("assertURLMatches", regexp => {
  cy.url().should("match", regexp);
});

// wait until data loads - until then the UI is obscured
// (can be pretty slow on CI)
Cypress.Commands.add("waitForNewspackWizardLoad", value => {
  cy.waitUntil(() => Cypress.$(".newspack-wizard__is-loading").length === 0, {
    timeout: 20000
  });
});
