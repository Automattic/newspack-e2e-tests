describe("Homepage", () => {
  it("looks nice", () => {
    cy.visitWPURL("/");
    cy.compareVisualRegressionScreenshot(`homepage`);
  });
});
