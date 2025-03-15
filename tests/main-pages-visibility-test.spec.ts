import { test, expect } from '@playwright/test';
const account_name = 'ash.gm';

test('Main Page Visibility', async ({ page }) => {
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

	// Enable Advanced Mode and Developer Mode in Settings.
	await page.getByRole('switch', { name: 'Enable Advanced Mode' }).click();
 	await page.getByRole('switch', { name: 'Enable Developer Mode' }).click();

	// Go to the Resources page.
	await page.getByRole('link', { name: 'Resources' }).click();

	// Check if the page contains the text Manage CPU, NET, and RAM string.
	await expect(page.getByText('Manage CPU, NET, and RAM')).toBeVisible();

	// Go to the Rent resources with PowerUp page.
	await page.getByRole('link', { name: 'Rent resources with PowerUp' }).click();

	// Check if the page contains the text Rent CPU and NET resources string.
 	await expect(page.getByText('Rent CPU and NET resources on')).toBeVisible();

	// Go back to Resources page.
	await page.locator('header').filter({ hasText: 'Rent Resources Rent CPU and' }).getByRole('button').click();

	// Go to the Rent resources with REX page.
	await page.getByRole('link', { name: 'Rent resources with REX' }).click();

	// Check if the page contains the text Rent with REX string.
 	await expect(page.getByText('Rent with Rex')).toBeVisible();

	// Go back to Resources page.
	await page.locator('header').filter({ hasText: 'Jungle 4 (Testnet) Network' }).getByRole('button').click();

	// Go to the Stake EOS for resources page.
	await page.getByRole('link', { name: 'Stake EOS for resources' }).click();

	// Check if the page contains the text Renting string.
 	await expect(page.getByText('Renting', { exact: true })).toBeVisible();

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
