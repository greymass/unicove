import { PackedTransaction } from '@wharfkit/antelope';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/${params.network}/api/msig/${params.proposer}/${params.proposal}`);
	const json = await response.json();
	const packed = PackedTransaction.from({
		compression: false,
		signatures: [],
		packed_trx: json.proposal.packed_transaction,
		packed_context_free_data: []
	});
	const transaction = packed.getTransaction();
	return {
		title: `${params.proposal}`,
		subtitle: `An MSIG proposed by ${params.proposer} on the ${network.chain.name} Network`,
		proposal: {
			approvals: json.approvals,
			proposer: params.proposer,
			name: params.proposal,
			hash: transaction.id,
			packed,
			transaction
		}
	};
};
