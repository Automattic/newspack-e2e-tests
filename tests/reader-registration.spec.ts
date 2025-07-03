import { test, expect } from "@playwright/test";
import {
  addClickIndicator,
  randomString,
  goToEmailClient,
  clickLinkURL,
  randomEmailAddress,
} from "./utils";

const emailAddress = randomEmailAddress();

test.beforeEach(addClickIndicator);

test("Register on the site", {
      tag: '@with-woo',
    },
    async ({page}) => {
  /**
   * Create a new reader account using the "Sign In" header link.
   */
  await page.goto("/");
  await page.getByRole("link", { name: "Sign In" }).click();
  await page.getByRole("button", { name: "Create an account" }).click();
  await page.getByPlaceholder("Your email address", { exact: true }).click();
  await page
    .getByPlaceholder("Your email address", { exact: true })
    .fill(emailAddress);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("strong")).toContainText(
    "Success! Your account was created and you’re signed in."
  );
  await page.getByRole("link", { name: "Continue" }).click();
  await page.getByRole("link", { name: "My Account" }).click();
  await page.waitForURL(/my-account/);
  await page.getByText("Log out").click();

  /**
   * Log in as the previously created reader.
   */
  await page.goto("/");
  await page.getByRole("link", { name: "Sign In" }).click();
  await page
    .getByPlaceholder("Your email address", { exact: true })
    .fill(emailAddress);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Sign in").locator("form")).toContainText(
    "Enter the code sent to your email."
  );

  /**
   * Go to the email client to get the log in link.
   */
  await goToEmailClient(page, emailAddress);
  await page.getByText(`Sign in (${emailAddress}`).click();
  await clickLinkURL(page, "Continue to");

  /**
   * Now the user is authenticated via the magic link, they can update their name.
   */
  await page.getByRole("link", { name: "My Account" }).click();
  await page.getByPlaceholder("Your Name").click();
  await page.getByPlaceholder("Your Name").fill("John Doe");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Account details changed")).toBeVisible();
  await expect(page.getByPlaceholder("Your Name")).toHaveValue("John Doe");

  /**
   * Reader sets up a password.
   */
  await page
    .getByRole("link", { name: "Create a Password Email me a" })
    .click();
  await expect(
    page.getByText(
      "Please check your email inbox for instructions on how to set a new password."
    )
  ).toBeVisible();
  await goToEmailClient(page, emailAddress);
  await page.getByText(`Set a new password (${emailAddress}`).click();
  await clickLinkURL(page, "Set password");

  const password = randomString(14);
  await page
    .getByLabel("New password *Required", { exact: true })
    .fill(password);
  await page.getByLabel("Re-enter new password *").fill(password);
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByText("Log out").click();

  /**
   * Reader logs in using the password.
   */
  await page.goto("/");
  await page.getByRole("link", { name: "Sign In", exact: true }).click();
  await page
    .getByPlaceholder("Your email address", { exact: true })
    .fill(emailAddress);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Enter your password").fill("not the password");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Sign in").locator("form")).toContainText(
    "Password not recognized, try again."
  );
  await page.getByLabel("Enter your password").fill(password);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("strong")).toContainText(
    "Success! You’re signed in."
  );
  await page.getByRole("link", { name: "Continue" }).click();
  await page.getByRole("link", { name: "My Account" }).click();
  await page.waitForURL(/my-account/);

  /**
   * Reader updates their email address.
   */
  const newEmailAddress = randomEmailAddress();
  await page.locator("#newspack_account_email").fill(newEmailAddress);
  await page.getByRole("button", { name: "Save changes" }).click();
  const expectedNotification = `A verification email has been sent to ${newEmailAddress}. Please verify to complete the change.`;
  await expect(page.getByText(expectedNotification)).toBeVisible();
  await goToEmailClient(page, newEmailAddress);
  await page.getByText(`Confirm email change (${newEmailAddress})`).click();
  await clickLinkURL(page, "Confirm email change");
  await expect(
    page.getByText("Your email address has been successfully updated.")
  ).toBeVisible();
  await expect(page.locator("#newspack_account_email")).toHaveValue(
    newEmailAddress
  );
});
