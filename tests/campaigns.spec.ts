import { test, expect } from "@playwright/test";
import { logIn, goToAdminMenu, isMobileAdmin } from "./utils-admin";
import { randomString } from "./utils";

test("Create and view a prompt",  {
      tag: ['@vanilla', '@with-woo'],
    },
    async ({page}) => {
  await logIn(page);
  const isMobile = await isMobileAdmin(page);

  await goToAdminMenu("Audience", "Campaigns", page);

  await expect(page.getByRole("heading", { name: "Everyone" })).toBeVisible();
  await page.getByRole("button", { name: "Add New Campaign" }).click();
  await page.getByPlaceholder("Campaign Name").fill("Basic");
  await page.getByRole("button", { name: "Add" }).click();
  await page.waitForURL("**/campaigns/**");

  await page.getByRole("button", { name: "Add New Prompt" }).click();
  await page.getByRole("link", { name: "Center Overlay Fixed at the" }).click();
  await page.waitForURL(/post_type=newspack_popups_cpt/);

  // Create the prompt. The editor canvas is iframed in modern Gutenberg.
  const editorCanvas = page.frameLocator('iframe[name="editor-canvas"]');
  const randomId = randomString(4);
  const campaignBody = `This is prompt content (#${randomId})`;
  const campaignTitle = `Prompt #${randomId}`;
  await editorCanvas.getByLabel("Add title").fill(campaignTitle);
  await editorCanvas.getByLabel("Add default block").click();
  await editorCanvas.getByLabel("Empty block; start writing or").fill(campaignBody);

  if (isMobile) {
    await page.getByLabel("Settings", { exact: true }).click();
  }

  await page.getByRole("tab", { name: "Prompt" }).click();
  const isSettingsPanelOpen = await page.getByText("Prompt type").isVisible();
  if (!isSettingsPanelOpen) {
    await page
      .getByLabel("Editor settings")
      .getByRole("button", { name: "Settings", exact: true })
      .click();
  }
  await page.getByRole("spinbutton", { name: "Delay (seconds)" }).fill("1");

  // Preview the prompt.
  await page.getByRole("button", { name: "Preview" }).click();
  const previewFrame = page.frameLocator('iframe[title="web-preview"]');
  await expect(
    previewFrame.getByRole("button", { name: `draft ${campaignBody}` })
  ).toBeVisible();
  await expect(previewFrame.getByText(campaignBody)).toBeVisible();
  await page.getByLabel("Close Preview").click();

  // Publish the prompt.
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page
    .getByLabel("Editor publish")
    .getByRole("button", { name: "Publish", exact: true })
    .click();
  await expect(
    page.getByTestId("snackbar").getByText("Post published.")
  ).toBeVisible();

  // Go to the front-end and verify the prompt is visible.
  await page.goto("/");
  await expect(page.getByText(campaignBody)).toBeVisible();
  await page
    .getByRole("button", {
      name: `${campaignBody} Close Pop-up`,
    })
    .getByLabel("Close Pop-up")
    .click();
  await expect(page.getByText(campaignBody)).not.toBeVisible();

  // Delete the prompt.
  await goToAdminMenu("Audience", "Campaigns", page);
  await page.getByLabel("More options").click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(
    page.getByText("No active prompts in this segment.")
  ).toBeVisible();
});
