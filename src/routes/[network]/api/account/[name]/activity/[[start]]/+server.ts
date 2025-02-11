import { json, type RequestEvent } from '@sveltejs/kit';

import { getBackendNetwork } from '$lib/wharf/client/ssr.js';
import { getActivity } from './activity';
import { getCacheHeaders } from '$lib/utils';
import { getChainDefinitionFromParams } from '$lib/wharf/chains';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	if (!params.name) {
		return json({ error: 'Account name not specified.' }, { status: 500 });
	}

	const network = getBackendNetwork(chain, fetch, true);
	if (!network.supports('robo')) {
		return json({ error: `Activity not supported on ${network.chain.name}.` }, { status: 500 });
	}

	const start = Number(params.start) || 1;
	const requests = [getActivity(network.client, params.name, start)];
	const headers = getCacheHeaders(5);

	try {
		const [activity] = await Promise.all(requests);
		return json(
			{
				ts: new Date(),
				activity
			},
			{
				headers
			}
		);
	} catch (error) {
		console.error(error);
		return json({ error: 'Unable to load account.' }, { status: 500 });
	}
}
