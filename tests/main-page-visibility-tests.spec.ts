import { test, expect } from '@playwright/test';

// Constants
const ACCOUNT_NAME = 'ash.gm';
const SAMPLE_BLOCK_NUMBER = '123456';
const SAMPLE_CONTRACT = 'unicove.gm';
//const SAMPLE_PUBLIC_KEY = 'PUB_K1_53oXjiUsTRp8Vgm3AYbux6WyGUFqoDVAEGGHN8MeFUs8kMsZx6';
//const SAMPLE_PROPOSER = 'eosio';
//const SAMPLE_PROPOSAL = 'proposal1';
const SAMPLE_TRANSACTION_ID = '7644ea1a17f9540186a9b8cc38ef3dd231a0e088cbcf206d3b2016ba8e33ca65';
//const SAMPLE_TOKEN_SYMBOL = 'EOS';
//const DEFAULT_textToCheck = 'Purchase a Ledger Device';

// Define page routes with their URLs and expected textToChecks
const pages = [
	// Main pages
	{ url: './', textToCheck: 'Unicove: Your gateway to the', description: 'Go to the main page' },
	{
		url: './send/',
		textToCheck: 'Transfer tokens to another account.',
		description: 'Go to the Send page'
	},
	//{ url: './receive/', textToCheck: 'Receive', description: 'Go to the Receive page' },
	{
		url: './staking/',
		textToCheck: 'Stake EOS to earn rewards.',
		description: 'Go to the Staking page'
	},
	{
		url: './ram/',
		textToCheck: 'An overview of the EOS/RAM market on the',
		description: 'Go to the RAM page'
	},
	{ url: './ram/buy/', textToCheck: 'Amount of RAM to buy', description: 'Go to the Buy RAM page' },
	{
		url: './ram/sell/',
		textToCheck: 'Amount of RAM to sell',
		description: 'Go to the Sell RAM page'
	},
	{ url: './settings/', textToCheck: 'Configure Unicove', description: 'Go to the Settings page' },

	// Resource pages
	{
		url: './resources/',
		textToCheck: 'Manage CPU, NET, and RAM resources on the',
		description: 'Go to the Resources page'
	},
	{
		url: './resources/powerup/',
		textToCheck: 'Rent CPU and NET resources on the',
		description: 'Go to the Rent resources with PowerUp page'
	},
	{
		url: './resources/rex/',
		textToCheck: 'Rent with Rex',
		description: 'Go to the Rent resources with REX page'
	},
	{
		url: './resources/stake/',
		textToCheck: 'Rent Resources for my account',
		description: 'Go to the Stake EOS for resources page'
	},

	// Account management pages
	{
		url: './create-account/contract/',
		textToCheck: 'Create an account using a token transfer',
		description: 'Go to the Create Account contract page'
	},
	{
		url: './create-account/direct/',
		textToCheck: 'Create an account using your existing account',
		description: 'Go to the Create Account direct page'
	},
	{ url: './fund/', textToCheck: 'Purchase Directly', description: 'Go to the Fund page' },
	//{ url: './move/', textToCheck: 'Move', description: 'Go to the Move page' },
	{
		url: './refund/',
		textToCheck: 'Claim previously delegated EOS tokens',
		description: 'Go to the Refund page'
	},
	{
		url: './undelegate/',
		textToCheck: 'Undelegate and reclaim previously delegated EOS tokens',
		description: 'Go to the Undelegate page'
	},
	//{ url: './vote/', textToCheck: 'Vote', description: 'Go to the Vote page' },
	//{ url: './transactions/', textToCheck: 'Transactions', description: 'Go to the Transactions page' },

	// Sign up and wallet pages
	{
		url: './signup/',
		textToCheck: 'Select a wallet and create an account on the',
		description: 'Go to the Sign Up page'
	},
	{
		url: './signup/wallets/',
		textToCheck: 'A wallet is your gateway to the blockchain',
		description: 'Go to the Wallets page'
	},
	{
		url: './signup/wallets/desktop/anchor/',
		textToCheck: 'Why Choose Anchor Desktop?',
		description: 'Go to the Desktop Anchor page'
	},
	{
		url: './signup/wallets/desktop/wombat/',
		textToCheck: 'Why Choose Wombat Desktop?',
		description: 'Go to the Desktop Wombat page'
	},
	{
		url: './signup/wallets/extensions/metamask/',
		textToCheck: 'Sign Up with MetaMask',
		description: 'Go to the MetaMask page'
	},
	{
		url: './signup/wallets/extensions/wombat/',
		textToCheck: 'Why Choose Wombat Browser Extension?',
		description: 'Go to the Wombat Extension page'
	},
	{
		url: './signup/wallets/hardware/ledger/',
		textToCheck: 'Purchase a Ledger Device',
		description: 'Go to the Sign Up with Ledger page'
	},
	{
		url: './signup/wallets/mobile/anchor/',
		textToCheck: 'Why Choose Anchor Mobile?',
		description: 'Go to the Mobile Anchor page'
	},
	{
		url: './signup/wallets/mobile/tokenpocket/',
		textToCheck: 'Why Choose TokenPocket?',
		description: 'Go to the TokenPocket page'
	},
	{
		url: './signup/wallets/mobile/wombat/',
		textToCheck: 'Why Choose Wombat?',
		description: 'Go to the Mobile Wombat page'
	},
	{
		url: './welcome/wallet/',
		textToCheck: 'Your account is ready to use',
		description: 'Go to the Welcome page'
	},

	// Account explorer pages
	{
		url: `./account/${ACCOUNT_NAME}/`,
		textToCheck: `${ACCOUNT_NAME}`,
		description: 'Go to the account page'
	},
	{
		url: `./account/${ACCOUNT_NAME}/activity/`,
		textToCheck: 'Recent activity on the',
		description: 'Go to the account activity page'
	},
	{
		url: `./account/${ACCOUNT_NAME}/authority/`,
		textToCheck: 'Accounts allowing this account to sign on their behalf',
		description: 'Go to the account authority page'
	},
	{
		url: `./account/${ACCOUNT_NAME}/balances/`,
		textToCheck: 'Token balances on the',
		description: 'Go to the account balances page'
	},
	{
		url: `./account/${ACCOUNT_NAME}/chaindata/`,
		textToCheck: 'Raw data from the',
		description: 'Go to the account chaindata page'
	},
	{
		url: `./account/${ACCOUNT_NAME}/data/`,
		textToCheck: 'Account overview on the',
		description: 'Go to the account data page'
	},
	{
		url: `./account/${ACCOUNT_NAME}/permissions/`,
		textToCheck: 'Permissions on the',
		description: 'Go to the account permissions page'
	},
	{
		url: `./account/${ACCOUNT_NAME}/proposals/`,
		textToCheck: `Multisig proposals by ${ACCOUNT_NAME}`,
		description: 'Go to the account proposals page'
	},
	{
		url: `./account/${ACCOUNT_NAME}/ram/`,
		textToCheck: 'Account RAM',
		description: 'Go to the account RAM page'
	},
	{
		url: `./account/${ACCOUNT_NAME}/resources/`,
		textToCheck: 'RAM Prices',
		description: 'Go to the account resources page'
	},
	//{ url: `./account/${ACCOUNT_NAME}/staked/`, textToCheck: 'props.account updated', description: 'Go to the account staked page' },
	{
		url: `./account/${ACCOUNT_NAME}/votes/`,
		textToCheck: 'Proxied To',
		description: 'Go to the account votes page'
	},

	// Block explorer pages
	{
		url: `./block/${SAMPLE_BLOCK_NUMBER}/`,
		textToCheck: 'Block Details',
		description: 'Go to the block page'
	},
	{
		url: `./block/${SAMPLE_BLOCK_NUMBER}/data/`,
		textToCheck: 'hippopotamus',
		description: 'Go to the block data page'
	},

	// Contract pages
	{
		url: `./contract/${SAMPLE_CONTRACT}/`,
		textToCheck: 'abi_hash',
		description: 'Go to the contract page'
	},
	{
		url: `./contract/${SAMPLE_CONTRACT}/abi/`,
		textToCheck: 'eosio::abi/1.2',
		description: 'Go to the contract ABI page'
	},
	{
		url: `./contract/${SAMPLE_CONTRACT}/actions/`,
		textToCheck:
			'The actions for this contract with their input parameters and potential response data.',
		description: 'Go to the contract actions page'
	},
	{
		url: `./contract/${SAMPLE_CONTRACT}/structs/`,
		textToCheck: `The data structures defined by this contract.`,
		description: 'Go to the contract structs page'
	},
	{
		url: `./contract/${SAMPLE_CONTRACT}/tables/`,
		textToCheck: 'The data tables defined by this contract.',
		description: 'Go to the contract tables page'
	},
	{
		url: `./contract/${SAMPLE_CONTRACT}/tables/accounts/`,
		textToCheck: 'Table Browser',
		description: 'Go to the contract specific table page'
	},
	// add more contract pages

	// Other explorer pages
	//{ url: `./key/${SAMPLE_PUBLIC_KEY}/`, textToCheck: 'associated with this public key', description: 'Go to the public key page' },
	//{ url: `./msig/${SAMPLE_PROPOSER}/${SAMPLE_PROPOSAL}/`, textToCheck: DEFAULT_textToCheck, description: 'Go to the multisig proposal page' },
	//{ url: `./msig/${SAMPLE_PROPOSER}/${SAMPLE_PROPOSAL}/data/`, textToCheck: DEFAULT_textToCheck, description: 'Go to the multisig proposal data page' },
	{ url: './network/', textToCheck: 'Network Overview', description: 'Go to the network page' },
	{ url: './token/', textToCheck: 'baseMetaTags', description: 'Go to the tokens page' },
	//{ url: `./token/${SAMPLE_CONTRACT}/${SAMPLE_TOKEN_SYMBOL}/`, textToCheck: DEFAULT_textToCheck, description: 'Go to the specific token page' },

	// Transaction pages
	{
		url: `./transaction/${SAMPLE_TRANSACTION_ID}/`,
		textToCheck: `${SAMPLE_TRANSACTION_ID}`,
		description: 'Go to the transaction page'
	},
	{
		url: `./transaction/${SAMPLE_TRANSACTION_ID}/actions/`,
		textToCheck: 'The actions performed in the transaction, without the inline actions.',
		description: 'Go to the transaction actions page'
	},
	{
		url: `./transaction/${SAMPLE_TRANSACTION_ID}/contracts/`,
		textToCheck: 'eosio.token',
		description: 'Go to the transaction contracts page'
	},
	{
		url: `./transaction/${SAMPLE_TRANSACTION_ID}/data/`,
		textToCheck: 'The raw data for the transaction.',
		description: 'Go to the transaction data page'
	},
	{
		url: `./transaction/${SAMPLE_TRANSACTION_ID}/ram/`,
		textToCheck: 'The deltas in RAM usage for each trace in the transaction.',
		description: 'Go to the transaction RAM page'
	},
	{
		url: `./transaction/${SAMPLE_TRANSACTION_ID}/resources/`,
		textToCheck: 'Resources',
		description: 'Go to the transaction resources page'
	},
	{
		url: `./transaction/${SAMPLE_TRANSACTION_ID}/traces/`,
		textToCheck: 'The individual transaction traces from the transaction.',
		description: 'Go to the transaction traces page'
	},
	{
		url: `./transaction/${SAMPLE_TRANSACTION_ID}/transaction/`,
		textToCheck: 'The raw transaction as it was performed.',
		description: 'Go to the transaction details page'
	},

	// Homepage and debug pages
	{
		url: './metamask/',
		textToCheck: 'Add EOS Wallet to MetaMask',
		description: 'Go to the homepage metamask page'
	}
	//{ url: './debug/', textToCheck: 'Debug', description: 'Go to the debug page' },
	//{ url: './debug/account/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug account page' },
	//{ url: './debug/components/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug components page' },
	//{ url: './debug/components/summaries/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug components summaries page' },
	//{ url: './debug/input/asset/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug input asset page' },
	//{ url: './debug/input/name/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug input name page' },
	//{ url: './debug/opengraph/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug opengraph page' },
	//{ url: './debug/state/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug state page' },
	//{ url: './debug/state/account/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug state account page' },
	//{ url: './debug/state/config/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug state config page' },
	//{ url: './debug/state/market/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug state market page' },
	//{ url: './debug/state/network/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug state network page' },
	//{ url: './debug/state/wharf/', textToCheck: DEFAULT_textToCheck, description: 'Go to the debug state wharf page' }
];

// Using test.describe.parallel to run tests in parallel
test.describe.parallel('Unicove pages visibility', () => {
	for (const pageInfo of pages) {
		test(`${pageInfo.description}`, async ({ page, browserName }) => {
			test.setTimeout(5000); // Timeout per individual test

			try {
				await page.goto(pageInfo.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
				await expect(page.getByText(pageInfo.textToCheck)).toBeVisible({ timeout: 10000 });
				console.log(`[${browserName}] ✓ Passed: ${pageInfo.description}`);
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : String(error);

				console.error(`[${browserName}] ✗ Failed: ${pageInfo.url} - ${pageInfo.description}`);
				console.error(`[${browserName}]   Expected text: "${pageInfo.textToCheck}"`);
				console.error(`[${browserName}]   Error: ${errorMessage}`);
			}
		});
	}
});
