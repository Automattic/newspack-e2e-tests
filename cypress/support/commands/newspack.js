Cypress.Commands.add(
  "visitNewspackWizard",
  (wizardTitle, { direct = false } = {}) => {
    if (direct) {
      const wizardSlug = { Campaigns: "popups" }[wizardTitle];
      cy.visitWPURL(`/wp-admin/admin.php?page=newspack-${wizardSlug}-wizard`);
    } else {
      cy.wpLogin();
      cy.get("#adminmenu")
        .contains("Newspack")
        .click();
      cy.contains(wizardTitle).click();

      // Wizard title.
      cy.get("h1").contains(wizardTitle);
    }
  }
);
