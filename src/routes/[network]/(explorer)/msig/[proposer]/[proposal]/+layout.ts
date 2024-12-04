import { Name, PackedTransaction, PermissionLevel, Serializer } from '@wharfkit/antelope';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/${params.network}/api/msig/${params.proposer}/${params.proposal}`);
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

	const actions = await Promise.all(
		transaction.actions.map(async (a) => {
			const { abi } = await network.client.v1.chain.get_abi(String(a.account));
			if (abi) {
				const decoded = a.decodeData(abi);
				return Serializer.objectify(decoded) as Record<string, unknown>;
			}
			return {};
		})
	);

	return {
		title: `${params.proposal}`,
		subtitle: `An MSIG proposed by ${params.proposer} on the ${network.chain.name} Network`,
		proposal: {
			approvals: { proposal_name, requested_approvals, provided_approvals, version },
			proposer: params.proposer,
			name: params.proposal,
			hash: transaction.id,
			packed,
			transaction,
			actions
		}
	};
};
