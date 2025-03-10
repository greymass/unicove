import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
	// Login with test account.
	await page.goto('./en/jungle4/debug/account');
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Login' }).click({ force: true });

	// Debugging: Ensure the button is clicked
	console.log('Button clicked');
	// Wait for the label to appear
	console.log('Waiting for account-switcher-label...');
	await page.waitForSelector('label[for="account-switcher-label"]', { timeout: 10000 });
	console.log('Label found.');
	try {
		await expect(page.getByLabel('account-switcher-label').locator('div')).toContainText(
			'wharfkit1133'
		);
	} catch (error) {
		await page.screenshot({ path: 'debug.png' });
		console.log('Error:', error);
		throw error;
	}

	// Go to the main page.
	await page.getByRole('link', { name: 'My Account' }).click();
	await expect(
		page.getByRole('heading', { name: 'wharfkit1133 Copy' }).locator('span')
	).toBeVisible();

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
