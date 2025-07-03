import { test, expect } from "@playwright/test";

import {logIn} from "./utils-admin";

test("Top featured post and edit homepage", {
        tag: ['@vanilla', '@with-woo'],
    },
    async ({page}) => {
    await logIn(page);
    // Go to the homepage and click the featured post.
    await page.goto('/');
    await page.locator('.wp-block-newspack-blocks-homepage-articles').first().click();
    // On the post - grab the title of the post.
    const featuredPostTitle = await page.locator('h1').textContent();
    // And go back to the homepage.
    await page.goto('/');

    // Click "Edit Page" to edit the homepage in the editor.
    await page.locator('#wp-admin-bar-edit a').click();
    // Check that our post title is there in the editor.
    await expect(page.locator('#editor .wp-block-newspack-blocks-homepage-articles').first().filter({ hasText: featuredPostTitle })).toBeVisible();
});
