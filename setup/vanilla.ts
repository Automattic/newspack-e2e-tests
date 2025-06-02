import {loadSnapshot} from "../tests/utils-admin";
import {test} from "@playwright/test";

test('Setup Vanilla', async ({ page }, testInfo) => {
    await loadSnapshot(page, 'vanilla');
})