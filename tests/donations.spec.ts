import "./setup";

import { test, expect } from "@playwright/test";
import { randomEmailAddress } from "./utils";

const getPageInIframe = (page) =>
  page.frameLocator('iframe[name="newspack_modal_checkout_iframe"]');

const getStripeIframeCard = (page) =>
  getPageInIframe(page).frameLocator(`[data-payment-method-type="card"] [title="Secure payment input frame"]`);

const emailAddress = randomEmailAddress();

test("Donations", async ({ page }) => {
  /**
   * Make a donation.
   */
  await page.goto("/support-our-publication/");
  await page.getByRole("button", { name: "Donate Now" }).click();
  await expect(
    getPageInIframe(page).locator(
      'strong:has-text("Donate: Monthly: $15.00 / month")'
    )
  ).toBeVisible();
  await getPageInIframe(page).getByLabel("Email address *").fill(emailAddress);
  await getPageInIframe(page).getByLabel("First name *").fill("John");
  await getPageInIframe(page).getByLabel("Last name *").fill("Doe");

  await getPageInIframe(page).getByRole("button", { name: "Continue" }).click();

  await getStripeIframeCard(page)
    .getByPlaceholder("1234 1234 1234 1234")
    .fill("4242 4242 4242 42424");
  await getStripeIframeCard(page).getByPlaceholder("MM / YY").fill("04 / 44");
  await getStripeIframeCard(page).getByLabel("Security code").fill("333");

  // Depending on geo, Stripe may want a ZIP code, too.
  const zipLocator = await getStripeIframeCard(page).getByPlaceholder("12345");
  if (await zipLocator.isVisible()) {
    await getStripeIframeCard(page).getByPlaceholder("12345").fill("12345");
  }

  await getPageInIframe(page)
    .getByRole("button", { name: "Donate now" })
    .click();

  await expect(
    page.getByRole("heading", { name: "Transaction successful" })
  ).toBeVisible();

  await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  await getPageInIframe(page).getByRole("button", { text: "Continue" }).click();
  await expect(page.getByRole("button", { name: "Close" })).not.toBeVisible();

  /**
   * Go to "My Account" page – it's now available as the reader account has been created.
   */
  await page.getByRole("link", { name: "My Account" }).click();
  await expect(page.locator("#newspack_account_email")).toHaveValue(
    emailAddress
  );
  await page.getByRole("link", { name: "My Subscription" }).click();

  await expect(page.getByText("Via visa card ending in 4242")).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "$15.00 / month" }).first()
  ).toBeVisible();
});
