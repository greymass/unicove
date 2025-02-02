import { json } from '@sveltejs/kit';
import { type API } from '@wharfkit/antelope';
import type { RequestEvent, RequestHandler } from './$types';

import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import { getBackendNetwork } from '$lib/wharf/client/ssr';

export const GET: RequestHandler = async ({ fetch, params }: RequestEvent) => {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch);

	const requests: [Promise<API.v1.GetAbiResponse>] = [
		network.client.v1.chain.get_abi(params.contract)
	];

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
};
