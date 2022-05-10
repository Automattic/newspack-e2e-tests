import { tagline, facebookURL } from "./0-plugin-set-up";

const copyrightText = "All material here is semi-random.";

describe("Homepage", () => {
  it("Verify the default homepage design", () => {
    cy.visitWPURL("/");
    cy.get("header").contains(tagline);
    cy.get(`footer a[href="${facebookURL}"]`);
  });

  it("Configure design settings", () => {
    cy.visitNewspackWizard("Site Design");

    cy.fillColorInput("3366ff", "FFD500");
    cy.fillColorInput("666666", "12C739");
    cy.selectOption("Headings", "Lato");
    cy.selectOption("Body", "Noto Serif");
    cy.checkInput("Apply a background color to the header");
    cy.fillColorInput("3366ff", "FFD500");
    cy.fillInput("Copyright information", copyrightText);
    cy.contains("Save").click();

    cy.contains("Log Out").click({ force: true });
  });

  it("Verify the homepage after changes", () => {
    cy.visitWPURL("/");
    cy.get("footer").contains(copyrightText);
  });
});
