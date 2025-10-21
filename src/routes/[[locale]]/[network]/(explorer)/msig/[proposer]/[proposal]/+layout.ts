import { Name, PackedTransaction, PermissionLevel } from '@wharfkit/antelope';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/en/${network}/api/msig/${params.proposer}/${params.proposal}`);
	const json = await response.json();

	if ('error' in json) {
		error(404, json.error);
	}

	const packed = PackedTransaction.from({
		compression: false,
		signatures: [],
		packed_trx: json.proposal.packed_transaction,
		packed_context_free_data: []
	});

	const transaction = packed.getTransaction();

	const proposal_name = Name.from(json.approvals.proposal_name);

	const version = Number(json.approvals.version);

	const requested_approvals: PermissionLevel[] = json.approvals.requested_approvals.map(
		({ level }: { level?: PermissionLevel }) => (level ? PermissionLevel.from(level) : undefined)
	);

	const provided_approvals: PermissionLevel[] = json.approvals.provided_approvals.map(
		({ level }: { level?: PermissionLevel }) => (level ? PermissionLevel.from(level) : undefined)
	);

	return {
		title: `${params.proposal}`,
		subtitle: m.msig_page_subtitle({
			proposer: params.proposer,
			network: network.chain.name
		}),
		header: {
			copyData: params.proposal
		},
		proposal: {
			approvals: { proposal_name, requested_approvals, provided_approvals, version },
			proposer: params.proposer,
			name: params.proposal,
			hash: transaction.id,
			packed,
			transaction
		},
		producers: json.producers
	};
};
