const compareSnapshotCommand = require("cypress-visual-regression/dist/command");

compareSnapshotCommand();

// take a visual regression screenshot only
Cypress.Commands.add(
  "compareVisualRegressionScreenshot",
  (screenshotName, { viewport = "macbook-13", element = "body" } = {}) => {
    if (Cypress.env("type")) {
      cy.viewport(viewport);

      Cypress.$("#wpadminbar").hide();
      cy.get(element).compareSnapshot(screenshotName, 0.1);
    }
  }
);
