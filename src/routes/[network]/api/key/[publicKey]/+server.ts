import { json, type RequestEvent } from '@sveltejs/kit';

import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import { getBackendNetwork } from '$lib/wharf/client/ssr.js';
import { PublicKey } from '@wharfkit/antelope';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch);
	try {
		// Validate public key format before making request
		let publicKey;
		try {
			publicKey = PublicKey.from(String(params.publicKey));
		} catch (e) {
			return json({ error: 'Invalid public key format' }, { status: 400 });
		}

		const response = await network.client.v1.chain.get_accounts_by_authorizers({
			keys: [String(publicKey)]
		});

		const accounts = response.accounts
			.reduce<string[]>((acc, { account_name }) => {
				const name = String(account_name);
				return acc.includes(name) ? acc : [...acc, name];
			}, [])
			.sort((a, b) => a.localeCompare(b));

		return json({
			accounts
		});
	} catch (error) {
		console.error(error);
		return json({ error: 'Unable to load accounts for public key.' }, { status: 500 });
	}
}
