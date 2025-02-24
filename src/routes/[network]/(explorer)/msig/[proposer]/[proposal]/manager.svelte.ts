import {
	ABI,
	Name,
	PermissionLevel,
	Serializer,
	type Action,
	type Checksum256,
	type Transaction
} from '@wharfkit/antelope';
import dayjs from 'dayjs';

import type { UnicoveContext } from '$lib/state/client.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import * as SystemContract from '$lib/wharf/contracts/system';
import type { TransactResult } from '@wharfkit/session';

type Proposal = {
	proposer: string;
	name: string;
	hash: Checksum256;
	approvals: {
		provided_approvals: PermissionLevel[];
		requested_approvals: PermissionLevel[];
	};
	transaction: Transaction;
};

interface Approvals {
	requested: PermissionLevel[];
	provided: PermissionLevel[];
}

interface DecodedAction {
	abi?: ABI;
	action: Action;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readable?: Record<string, any>;
}

export class ApprovalManager {
	network: NetworkState = $state() as NetworkState;
	wharf: WharfState = $state() as WharfState;
	proposal: Proposal;

	// States related to proposal
	result: TransactResult | null = $state(null);
	actions: Action[] = $state([]);
	readable: DecodedAction[] = $state([]);

	expiration = $derived.by(() => this.proposal.transaction.expiration.toDate());
	expired = $derived.by(() => dayjs(this.expiration).isBefore());
	expiresIn = $derived.by(() => dayjs(this.expiration).fromNow());

	approvals: Approvals = $state({
		requested: [],
		provided: []
	});
	participants = $derived.by(() => [...this.approvals.provided, ...this.approvals.requested]);
	totalRequested = $derived(this.approvals.provided.length + this.approvals.requested.length);
	totalApproved = $derived.by(() => this.approvals.provided.length);
	approvalRatio = $derived((this.totalApproved / this.totalRequested) * 100);

	// States related to user
	userHasApproved = $derived.by(() =>
		this.accountHasApproved(this.wharf?.session?.permissionLevel)
	);
	userIsProposer = $derived.by(() => this.wharf?.session?.actor.equals(this.proposal.proposer));
	userIsApprover = $derived.by(() =>
		this.participants.some(
			(a) => this.wharf?.session && a.equals(this.wharf?.session.permissionLevel)
		)
	);

	constructor(context: UnicoveContext, proposal: Proposal) {
		this.network = context.network;
		this.wharf = context.wharf;
		this.proposal = proposal;

		this.approvals = {
			requested: proposal.approvals.requested_approvals,
			provided: proposal.approvals.provided_approvals
		};
	}

	async sync(network: NetworkState, wharf: WharfState) {
		this.network = network;
		this.wharf = wharf;

		const overrides: Record<string, ABI> = {};
		const readable: DecodedAction[] = [];
		this.actions = this.proposal.transaction.actions;
		for (const action of this.proposal.transaction.actions) {
			// Check if an ABI override exists
			let abi: ABI | undefined = overrides[String(action.account)];

			// If not, retrieve from cache/network
			if (!abi) {
				try {
					abi = await network.abis?.getAbi(action.account);
				} catch (e) {
					console.error(e);
				}
			}

			// If unavailable, abort decoding and return raw
			if (!abi) {
				readable.push({ action });
				continue;
			}

			// Decode action data and push to readable
			const decoded = action.decodeData(abi);
			readable.push({
				action,
				abi,
				readable: {
					...action,
					data: Serializer.objectify(decoded)
				}
			});

			// If this action is a setabi, set override for future actions in loop
			if (action.account.equals('eosio') && action.name.equals('setabi')) {
				const setabi = SystemContract.Types.setabi.from(action.data);
				const decoded = Serializer.decode({
					type: ABI,
					data: setabi.abi
				});
				overrides[String(setabi.account)] = decoded;
			}
		}
		this.readable = readable;
	}

	accountHasApproved = (account?: PermissionLevel) => {
		if (!account) return false;
		return this.approvals.provided.some((a) => a.equals(account));
	};

	accountApprove = (account: PermissionLevel) => {
		this.approvals.provided.push(account);
		const index = this.approvals.requested.findIndex((a) => a.equals(account));
		if (index >= 0) {
			this.approvals.requested.splice(index, 1);
		}
	};

	accountUnapprove = (account: PermissionLevel) => {
		this.approvals.requested.push(account);
		const index = this.approvals.provided.findIndex((a) => a.equals(account));
		if (index >= 0) {
			this.approvals.provided.splice(index, 1);
		}
	};

	async approve() {
		if (!this.wharf.session) {
			throw new Error('Must be logged in to sign.');
		}

		const action = this.network.contracts.msig.action('approve', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			level: this.wharf.session.permissionLevel,
			proposal_hash: this.proposal.hash
		});

		this.result = await this.wharf.transact({ action });
		this.accountApprove(this.wharf.session.permissionLevel);
	}

	async unapprove() {
		if (!this.wharf.session) {
			throw new Error('Must be logged in to sign.');
		}

		const action = this.network.contracts.msig.action('unapprove', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			level: this.wharf.session.permissionLevel
		});

		this.result = await this.wharf.transact({ action });
		this.accountUnapprove(this.wharf.session.permissionLevel);
	}

	async execute() {
		if (!this.wharf.session) {
			throw new Error('Must be logged in to sign.');
		}

		const action = this.network.contracts.msig.action('exec', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			executer: this.wharf.session.actor
		});

		this.result = await this.wharf.transact({ action });
	}

	async cancel() {
		if (!this.wharf.session) {
			throw new Error('Must be logged in to sign.');
		}

		const action = this.network.contracts.msig.action('cancel', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			canceler: this.wharf.session.actor
		});

		this.result = await this.wharf.transact({ action });
	}

	toJSON() {
		return {
			expiration: this.expiration,
			expired: this.expired,
			expiresIn: this.expiresIn,
			approvals: this.approvals,
			totalRequested: this.totalRequested,
			totalApproved: this.totalApproved,
			approvalRatio: this.approvalRatio,
			userHasApproved: this.userHasApproved,
			userIsProposer: this.userIsProposer,
			userIsApprover: this.userIsApprover,
			network: this.network,
			proposal: this.proposal
		};
	}
}
