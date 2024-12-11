import { json, type RequestEvent } from '@sveltejs/kit';

import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
import { Name } from '@wharfkit/antelope';
import { getCacheHeaders } from '$lib/utils';
import { getBackendNetwork } from '$lib/wharf/client/ssr.js';
import { ORIGIN } from '$env/static/private';

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

	const proposals = await network.client.v1.chain.get_table_rows({
		code: 'eosio.msig',
		scope: params.proposer,
		table: 'proposal',
		lower_bound: Name.from(params.proposal),
		upper_bound: Name.from(params.proposal),
		limit: 1
	});

	if (!proposals.rows.length) {
		return json({ error: 'msig record not found' }, { status: 404 });
	}

	const approvals2 = await network.client.v1.chain.get_table_rows({
		code: 'eosio.msig',
		scope: params.proposer,
		table: 'approvals2',
		lower_bound: Name.from(params.proposal),
		upper_bound: Name.from(params.proposal),
		limit: 1
	});

	const proposal = proposals.rows[0];
	const approvals = approvals2.rows[0];
	const response = await fetch(`${ORIGIN}/${params.network}/api/producers/top30`);
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
