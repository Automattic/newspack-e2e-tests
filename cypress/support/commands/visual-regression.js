const compareSnapshotCommand = require("cypress-visual-regression/dist/command");

compareSnapshotCommand();

// take a visual regression screenshot only
Cypress.Commands.add(
  "compareVisualRegressionScreenshot",
  (element, screenshotName) => {
    if (Cypress.env("type")) {
      cy.get("#newspack-setup-wizard").compareSnapshot("wizard-after-about");
    }
  }
);
