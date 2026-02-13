import { json } from '@sveltejs/kit';
import { Name, PackedTransaction } from '@wharfkit/antelope';

import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from './$types';
import * as MsigContract from '$lib/wharf/contracts/msig';
import { localizePath } from '$lib/utils/url';

export async function GET({ fetch, locals: { network }, params }: RequestEvent) {
	const proposer = Name.from(params.proposer);
	const proposal_name = Name.from(params.proposal);

	const producersResponse = await fetch(localizePath(`/api/producers/top30`));
	const { producers } = await producersResponse.json();

	if (network.supports('msigapi')) {
		try {
			const result = await network.msigs.get_proposal(proposer, proposal_name);
			return json(
				{
					ts: new Date(),
					proposer: String(result.proposer),
					name: String(result.proposal_name),
					producers,
					status: result.status,
					transaction: result.transaction,
					requested_approvals: result.requested_approvals || [],
					provided_approvals: result.provided_approvals || [],
					executed_at: result.executed_at ? String(result.executed_at) : undefined,
					executed_by: result.executed_by ? String(result.executed_by) : undefined,
					executed_trx_id: result.executed_trx_id ? String(result.executed_trx_id) : undefined
				},
				{ headers: getCacheHeaders(5) }
			);
		} catch {
			// Fall through to on-chain lookup
		}
	}

	const proposalRows = await network.client.v1.chain.get_table_rows({
		code: 'eosio.msig',
		scope: proposer,
		table: 'proposal',
		json: false,
		lower_bound: proposal_name,
		upper_bound: proposal_name,
		type: MsigContract.Types.proposal
	});
	if (!proposalRows.rows.length) {
		return json({ error: 'Proposal not found' }, { status: 404 });
	}
	const proposal = proposalRows.rows[0];

	const approvals = await network.contracts.msig.table('approvals2', proposer).get(proposal_name);

	const packed = PackedTransaction.from({
		compression: false,
		signatures: [],
		packed_trx: proposal.packed_transaction,
		packed_context_free_data: []
	});
	const transaction = packed.getTransaction();

	return json(
		{
			ts: new Date(),
			proposer: params.proposer,
			name: params.proposal,
			producers,
			status: 'proposed',
			transaction,
			requested_approvals: approvals
				? approvals.requested_approvals.map((a) => a.level)
				: [],
			provided_approvals: approvals
				? approvals.provided_approvals.map((a) => a.level)
				: []
		},
		{ headers: getCacheHeaders(5) }
	);
}
