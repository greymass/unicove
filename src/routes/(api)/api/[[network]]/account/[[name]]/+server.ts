import { json } from '@sveltejs/kit';

import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';

export async function GET({ fetch, params }) {
	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	if (!params.name) {
		return json({ error: 'Account name not specified.' }, { status: 500 });
	}

	const network = getNetwork(chain, fetch);

	const requests = [network.client.v1.chain.get_account(params.name)];

	try {
		const [account_data] = await Promise.all(requests);

		return json({
			ts: new Date(),
			account_data
		});
	} catch (error) {
		return json({ error: 'Unable to load account.' }, { status: 500 });
	}
}
