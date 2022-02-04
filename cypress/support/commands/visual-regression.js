const compareSnapshotCommand = require("cypress-visual-regression/dist/command");

compareSnapshotCommand();

// take a visual regression screenshot only
Cypress.Commands.add(
  "compareVisualRegressionScreenshot",
  (element, screenshotName) => {
    if (Cypress.env("type")) {
      Cypress.$("#wpadminbar").hide();
      cy.get(element).compareSnapshot(screenshotName);
    }
  }
);
