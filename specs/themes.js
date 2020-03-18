describe("Newspack themes", () => {
  it("Default theme", () => {
    cy.visitWPURL();

    cy.compareVisualRegressionScreenshot("body", "homepage-default-theme");

    // click on post title
    cy.get("h3")
      .first()
      .click();

    cy.compareVisualRegressionScreenshot("body", "post-default-theme");
  });
});
