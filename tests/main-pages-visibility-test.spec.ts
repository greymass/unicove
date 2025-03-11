import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
	// Login with test account.
	await page.goto('./');
	await page.waitForLoadState('networkidle');

	// Go to the Send page.
	await page.getByRole('navigation').getByRole('link', { name: 'Send' }).click();
	await expect(page.getByRole('heading', { name: 'Send Tokens' }).locator('span')).toBeVisible();

	// Go to the Staking page.
	await page.getByRole('link', { name: 'Staking' }).click();
	await expect(
		page.getByRole('heading', { name: 'Jungle 4 (Testnet) Network' }).locator('span')
	).toBeVisible();

	// Go to the RAM page.
	await page.getByRole('link', { name: 'RAM' }).click();
	await expect(page.getByText('EOS/RAM Market', { exact: true })).toBeVisible();

	// Go to the Settings page.
	await page.getByRole('link', { name: 'Settings' }).click();
	await expect(page.getByRole('heading', { name: 'Settings' }).locator('span')).toBeVisible();
});
