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
    .type(value);
});

Cypress.Commands.add("assertURLIncludes", value => {
  cy.url().should("include", value);
});
