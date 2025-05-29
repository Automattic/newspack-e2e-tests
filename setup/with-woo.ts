import {loadSnapshot} from "../tests/utils-admin";
import {test} from "@playwright/test";

test('load with-woo snapshot', async ({ page }, testInfo) => {
    const loaded = await loadSnapshot(page, 'with-woo');
    if (!loaded) {
        test.skip();
    }
})