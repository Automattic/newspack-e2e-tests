import {loadSnapshot} from "../tests/utils-admin";
import {test} from "@playwright/test";

test('load with-woo snapshot', async ({ page }, testInfo) => {
    await loadSnapshot(page, 'with-woo');
})