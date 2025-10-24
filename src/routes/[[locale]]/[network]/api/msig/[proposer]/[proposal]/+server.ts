import { json } from '@sveltejs/kit';
import { Name } from '@wharfkit/antelope';

import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';
import * as MsigContract from '$lib/wharf/contracts/msig';

export async function GET({ fetch, locals: { network }, params }: RequestEvent) {
	const scope = Name.from(params.proposer);
	const name = Name.from(params.proposal);

	const proposalRows = await network.client.v1.chain.get_table_rows({
		code: 'eosio.msig',
		scope: scope,
		table: 'proposal',
		json: false,
		lower_bound: name,
		upper_bound: name,
		type: MsigContract.Types.proposal
	});
	if (!proposalRows.rows.length) {
		return json({ error: 'Proposal not found' }, { status: 404 });
	}
	const proposal = proposalRows.rows[0];

	// TODO: This is broken?
	// const proposal = await network.contracts.msig.table('proposal', scope).get(name);

	const approvals = await network.contracts.msig.table('approvals2', scope).get(name);

	const response = await fetch(`/en/${network}/api/producers/top30`);
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
