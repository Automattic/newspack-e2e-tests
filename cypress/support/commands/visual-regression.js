const compareSnapshotCommand = require("cypress-visual-regression/dist/command");

compareSnapshotCommand();

Cypress.Commands.add(
  "compareVisualRegressionScreenshot",
  (element, screenshotName) => {
    if (Cypress.env("type")) {
      Cypress.$("#wpadminbar").hide();
      cy.get(element).compareSnapshot(screenshotName, 0.05);
    }
  }
);
