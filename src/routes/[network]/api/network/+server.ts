import { json } from '@sveltejs/kit';

import { getChainDefinitionFromParams, getNetwork } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import type { RAMState, REXState } from '@wharfkit/resources';
import { Types as DelphioracleTypes } from '$lib/wharf/contracts/delphioracle.js';

type ResponseType = RAMState | REXState | DelphioracleTypes.datapoints | undefined;

export async function GET({ fetch, params }) {
	const chain = getChainDefinitionFromParams(params.network);
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getNetwork(chain, fetch);
	if (!network.resources) {
		return json({ error: 'Network resources not initialized' }, { status: 500 });
	}

	const requests: Promise<ResponseType>[] = [
		network.resources.v1.ram.get_state(),
		network.resources.v1.rex.get_state()
	];

	if (network.contracts.delphioracle) {
		requests.push(network.contracts.delphioracle.table('datapoints', 'eosusd').get());
	}

	const [ramstate, rexstate, tokenstate] = await Promise.all(requests);

	const systemtoken = ramstate ? (ramstate as RAMState).quote.balance.symbol : undefined;

	const headers = getCacheHeaders(5);

	return json(
		{
			ts: new Date(),
			ramstate,
			rexstate,
			systemtoken,
			tokenstate
		},
		{
			headers
		}
	);
}
