import { json } from '@sveltejs/kit';

import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';
import { getBackendClient } from '$lib/wharf/client/ssr.js';
import { getActivity } from './activity';
import { getCacheHeaders } from '$lib/utils';

export async function GET({ fetch, params }) {
	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	if (!params.name) {
		return json({ error: 'Account name not specified.' }, { status: 500 });
	}

	const network = getNetwork(chain, fetch);
	if (!network.supports('robo')) {
		return json({ error: `Activity not supported on ${network.chain.name}.` }, { status: 500 });
	}

	const client = getBackendClient(fetch, network.shortname, { history: true });

	const requests = [getActivity(client, params.name)];
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
