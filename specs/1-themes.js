const checkTheme = (themeSlug, options = {}) => {
  if (!options.skipActivation) {
    it(`Switch to theme ${themeSlug}`, () => {
      cy.wpLogin();
      cy.visitWPURL("/wp-admin/admin.php?page=newspack-site-design-wizard");
      cy.waitForNewspackWizardLoad();

      cy.get(`#card--${themeSlug} button`)
        .first()
        // force, because the button is hidden - it's shown on hover
        .click({ force: true });
      cy.wait(1000);
      cy.waitForNewspackWizardLoad();
      cy.wpLogout();
    });
  }

  it(`Check theme ${themeSlug}`, () => {
    cy.visitWPURL();

    // wait for images to load
    cy.wait(1000);

    cy.compareVisualRegressionScreenshot("body", `${themeSlug}-homepage`);
    cy.viewport("iphone-6");
    cy.compareVisualRegressionScreenshot(
      "body",
      `${themeSlug}-homepage--phone`
    );

    // navigate to a post
    cy.get("h3")
      .first()
      .click();

    cy.compareVisualRegressionScreenshot("body", `${themeSlug}-post--phone`);
    cy.viewport(1000, 660);
    cy.compareVisualRegressionScreenshot("body", `${themeSlug}-post`);
  });
};

describe("Newspack themes", () => {
  checkTheme("newspack-theme", { skipActivation: true });
  checkTheme("newspack-scott");
  checkTheme("newspack-nelson");
  checkTheme("newspack-katharine");
  checkTheme("newspack-sacha");
  checkTheme("newspack-joseph");
});
