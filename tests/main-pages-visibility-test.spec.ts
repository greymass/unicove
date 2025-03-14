import { test, expect } from '@playwright/test';
const account_name = 'ash.gm';

test('test', async ({ page }) => {
	// Login with test account.
	await page.goto('./');
	await page.waitForLoadState('networkidle');

	// Go to the Send page.
	await page.getByRole('navigation').getByRole('link', { name: 'Send' }).click();
	await expect(page.getByRole('heading', { name: 'Send Tokens' }).locator('span')).toBeVisible();

	// Go to the Staking page.
	await page.getByRole('link', { name: 'Staking' }).click();

	// Check if the page contains the text Staking string.
	await expect(
		page.getByRole('heading', { name: 'Jungle 4 (Testnet) Network Staking' }).locator('span')
	).toBeVisible();

	// Go to the RAM page.
	await page.getByRole('link', { name: 'RAM' }).click();

	// Check if the page contains the text EOS/RAM Market string.
	await expect(page.getByText('EOS/RAM Market', { exact: true })).toBeVisible();

	// Go to the Settings page.
	await page.getByRole('link', { name: 'Settings' }).click();

	// Check if the page contains the text Settings string.
	await expect(page.getByRole('heading', { name: 'Settings' }).locator('span')).toBeVisible();

	// Search for a specific account.
	await page.getByRole('button', { name: 'search' }).click();

	// Fill the search input with the account.
	await page.getByRole('textbox', { name: 'Search Unicove' }).fill(account_name);

	// Click on the first account name in the list.
	await page
		.getByRole('link', { name: `${account_name} View account` })
		.first()
		.click();

	// Check if account name value corresponds to account_name
	await expect(page.locator('h1')).toContainText(account_name);

	// Go to the Activity page.
	await page.getByRole('link', { name: 'Activity' }).click();

	// Check if the page contains the text Recent activity on the Jungle 4 string.
	await expect(page.getByRole('article')).toContainText(
		'Recent activity on the Jungle 4 (Testnet) Network.'
	);

	// Go to the Balances page.
	await page.getByRole('link', { name: 'Balances' }).click();

	// Check if the page contains the text Token balances on the Jungle 4 string.
	await expect(page.getByRole('article')).toContainText(
		'Token balances on the Jungle 4 (Testnet) Network.'
	);
});
