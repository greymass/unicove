import { json } from '@sveltejs/kit';
import { Name } from '@wharfkit/antelope';

import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';

export async function GET({ locals: { network }, params }: RequestEvent) {
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
