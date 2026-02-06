import { expect, test } from "@playwright/test";

test("smoke: homepage loads", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/.+/);
});
