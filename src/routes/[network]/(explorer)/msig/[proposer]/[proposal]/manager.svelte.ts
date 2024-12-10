import { invalidateAll } from '$app/navigation';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import { Name, PermissionLevel, type Checksum256 } from '@wharfkit/antelope';
import type { AnyAction, Transaction } from '@wharfkit/session';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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

export class ApprovalManager {
	network: NetworkState | undefined = $state();
	wharf: WharfState | undefined = $state();
	proposal: Proposal;

	// States related to proposal
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

	constructor(network: NetworkState, proposal: Proposal) {
		this.network = network;
		this.proposal = proposal;

		this.approvals = {
			requested: proposal.approvals.requested_approvals,
			provided: proposal.approvals.provided_approvals
		};
	}

	sync(network: NetworkState, wharf: WharfState) {
		console.log('sync');
		this.network = network;
		this.wharf = wharf;
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
		if (!this.network || !this.wharf || !this.wharf.session) {
			throw new Error("Can't sign, data not ready");
		}

		const action = this.network.contracts.msig.action('approve', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			level: this.wharf.session.permissionLevel,
			proposal_hash: this.proposal.hash
		});

		await this.wharf.transact({ action });
		this.accountApprove(this.wharf.session.permissionLevel);
	}

	async unapprove() {
		if (!this.network || !this.wharf || !this.wharf.session) {
			throw new Error("Can't sign, data not ready");
		}

		const action = this.network.contracts.msig.action('unapprove', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			level: this.wharf.session.permissionLevel
		});

		await this.wharf.transact({ action });
		this.accountUnapprove(this.wharf.session.permissionLevel);
	}

	async execute() {
		if (!this.network || !this.wharf || !this.wharf.session) {
			throw new Error("Can't sign, data not ready");
		}

		const action = this.network.contracts.msig.action('exec', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			executer: this.wharf.session.actor
		});

		await this.wharf.transact({ action });
	}

	async cancel() {
		if (!this.network || !this.wharf || !this.wharf.session) {
			throw new Error("Can't sign, data not ready");
		}

		const action = this.network.contracts.msig.action('cancel', {
			proposer: Name.from(this.proposal.proposer),
			proposal_name: Name.from(this.proposal.name),
			canceler: this.wharf.session.actor
		});

		await this.wharf.transact({ action });
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
