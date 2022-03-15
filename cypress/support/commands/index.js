import "./wordpress";
import "./newspack";
import "./visual-regression";

Cypress.Commands.add("selectOption", (label, value) => {
  cy.contains("label", label)
    .invoke("attr", "for")
    .then((id) => cy.get(`#${id}`))
    .select(value);
});

Cypress.Commands.add("fillInput", (label, value) => {
  cy.contains(label)
    .siblings("input")
    .clear()
    .type(value)
    .should("have.value", value);
});

Cypress.Commands.add("fillInputByPlaceholder", (placeholder, value) => {
  cy.get(`input[placeholder="${placeholder}"]`)
    .clear()
    .type(value)
    .should("have.value", value);
});

Cypress.Commands.add("verifyInputValue", (label, value) => {
  cy.contains(label).siblings("input").should("have.value", value);
});

Cypress.Commands.add("checkInput", (label) => {
  cy.contains("label", label)
    .invoke("attr", "for")
    .then((id) => cy.get(`#${id}`))
    .check();
});

Cypress.Commands.add("assertURLIncludes", (value) => {
  cy.url().should("include", value);
});

Cypress.Commands.add("getIframe", (selector) => {
  cy.get(selector)
    .its("0.contentDocument.body")
    .should("not.be.empty")
    .then(cy.wrap);
});
