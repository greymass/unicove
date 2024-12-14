import { json, type RequestEvent } from '@sveltejs/kit';

import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
import { Name } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';
import { getBackendNetwork } from '$lib/wharf/client/ssr.js';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}
	if (!params.proposer) {
		return json({ error: 'Proposer must be specified' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch);

	const scope = Name.from(params.proposer);

	const proposals = await network.contracts.msig.table('proposal', scope).all();

	return json(
		{
			ts: new Date(),
			proposer: params.proposer,
			name: params.proposal,
			proposals
		},
		{
			headers: getCacheHeaders(5)
		}
	);
}
