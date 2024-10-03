import { json, type RequestEvent } from '@sveltejs/kit';

import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';
import { type API } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	if (!params.name) {
		return json({ error: 'Account name not specified.' }, { status: 500 });
	}

	const network = getNetwork(chain, fetch);

	const requests: [Promise<API.v1.GetAbiResponse>] = [network.client.v1.chain.get_abi(params.name)];

	try {
		const headers = getCacheHeaders(5);
		const [abi] = await Promise.all(requests);

		return json(
			{
				ts: new Date(),
				abi
			},
			{ headers }
		);
	} catch (error) {
		console.error(error);
		return json({ error: 'Unable to load account.' }, { status: 500 });
	}
}
