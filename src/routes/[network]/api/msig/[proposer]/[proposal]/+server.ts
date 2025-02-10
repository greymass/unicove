import { json, type RequestEvent } from '@sveltejs/kit';
import { Name } from '@wharfkit/antelope';

import { getCacheHeaders } from '$lib/utils';
import { getBackendNetwork } from '$lib/wharf/client/ssr.js';
import { getChainDefinitionFromParams } from '$lib/wharf/chains';

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}
	if (!params.proposer) {
		return json({ error: 'Proposer must be specified' }, { status: 400 });
	}
	if (!params.proposal) {
		return json({ error: 'Proposal name required' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch);

	const scope = Name.from(params.proposer);
	const name = Name.from(params.proposal);

	const proposal = await network.contracts.msig.table('proposal', scope).get(name);
	const approvals = await network.contracts.msig.table('approvals2', scope).get(name);

	const response = await fetch(`/${params.network}/api/producers/top30`);
	const { producers } = await response.json();

	return json(
		{
			ts: new Date(),
			proposer: params.proposer,
			name: params.proposal,
			producers,
			proposal,
			approvals
		},
		{
			headers: getCacheHeaders(5)
		}
	);
}
