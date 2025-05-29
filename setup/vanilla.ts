import {loadSnapshot} from "../tests/utils-admin";
import {test} from "@playwright/test";

test('Setup Vanilla', async ({ page }, testInfo) => {
    const loaded = await loadSnapshot(page, 'vanilla');
    if (!loaded) {
        test.skip();
    }

})