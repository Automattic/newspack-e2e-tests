describe("Donations", () => {
  it("Visit the Donations wizard", () => {
    cy.visitNewspackWizard("Reader Revenue");
  });

  it("Configure Stripe as platform", () => {
    // Warning is shown initially.
    cy.contains("The required plugins are not installed and activated.");
    // Wait for a WC install prompt.
    cy.contains("WooCommerce");

    cy.selectOption("Select Reader Revenue Platform", "stripe");
    cy.contains("a", "Stripe Settings").click();

    cy.contains("Save Settings").click();
    // Warning is shown if incomplete settings are saved.
    cy.contains("Publishable Key and Secret Key are required to use Stripe.");

    // Set Stripe credentials.
    cy.checkInput("Use Stripe in test mode");
    cy.fillInput("Test Publishable Key", Cypress.env("STRIPE_PUBLISHABLE_KEY"));
    cy.fillInput("Test Secret Key", Cypress.env("STRIPE_SECRET_KEY"));

    cy.contains("Save Settings").click();
  });

  it("Configure donations settings", () => {
    cy.contains("a", "Donations").click();
    // Warning is shown initially.
    cy.contains(
      "Your donations landing page has been created, but is not yet published."
    );
    cy.verifyMoneyInputValue("Suggested donation amount per month", "15");
    cy.verifyMoneyInputValue("Suggested one-time donation amount", "20");
    cy.fillMoneyInput("Suggested one-time donation amount", "2");
    cy.verifyMoneyInputValue("Suggested donation amount per month", "15");
    cy.fillMoneyInput("Suggested donation amount per month", "21");
    cy.verifyMoneyInputValue("Suggested donation amount per year", "180");
    cy.fillMoneyInput("Suggested donation amount per year", "42");

    cy.contains("Save Settings").click();
    cy.verifyMoneyInputValue("Suggested one-time donation amount", "2");
    cy.verifyMoneyInputValue("Suggested donation amount per month", "21");
    cy.verifyMoneyInputValue("Suggested donation amount per year", "42");
  });

  it("Configure donations page", () => {
    cy.contains("Edit Page").click();
    cy.wpDismissBlockEditorIntro();
    cy.wpPublishPost("Page");
    cy.contains("Log Out").click({ force: true });
  });

  it("Make a donation as a non-logged-in user", () => {
    cy.visitWPURL("/support-our-publication/");

    cy.contains("Support our publication");
    cy.contains("button", "Donate with card").click();

    const stripeIFrameSelector =
      "iframe[title='Secure card payment input frame']";
    cy.getIframe(stripeIFrameSelector)
      .find('input[placeholder="Card number"]')
      .type("4242424242424242");
    cy.getIframe(stripeIFrameSelector)
      .find('input[placeholder="MM / YY"]')
      .type("1232");
    cy.getIframe(stripeIFrameSelector)
      .find('input[placeholder="CVC"]')
      .type("222");
    cy.getIframe(stripeIFrameSelector)
      .find('input[placeholder="ZIP"]')
      .type("12345");

    const uniqId = Math.round(Math.random() * 999999);
    const donorEmail = `tester-${uniqId}@testers.com`;
    cy.fillInputByPlaceholder("Email", donorEmail);
    cy.fillInputByPlaceholder("Full Name", "Tester Testerson");

    cy.contains("button", "Donate with card").click();

    cy.contains("Processing payment…");

    cy.contains(
      `Your payment has been processed. Thank you for your contribution! You will receive a confirmation email at ${donorEmail}.`,
      { timeout: 120000 }
    );
  });
});
