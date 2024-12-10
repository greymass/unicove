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

export class ApprovalManager {
	network: NetworkState | undefined = $state();
	wharf: WharfState | undefined = $state();
	proposal: Proposal;
	error?: string = $state();
	transacting = $state(false);

	// States related to proposal
	approvals = $derived.by(() => [
		...this.proposal.approvals.provided_approvals,
		...this.proposal.approvals.requested_approvals
	]);
	proposalExpired = $derived.by(() =>
		dayjs(this.proposal.transaction.expiration.toDate()).isBefore()
	);
	totalRequested = $derived(this.approvals.length);
	totalApproved = $derived.by(() => this.proposal.approvals.provided_approvals.length);
	ratioApproved = $derived((this.totalApproved / this.totalRequested) * 100);
	relativeTimeToExpiry = $derived.by(() =>
		dayjs(this.proposal.transaction.expiration.toDate()).fromNow()
	);

	// States related to user
	userHasApproved = $derived.by(() =>
		this.accountHasApproved(this.wharf?.session?.permissionLevel)
	);
	userIsProposer = $derived.by(() => this.wharf?.session?.actor.equals(this.proposal.proposer));
	userIsApprover = $derived.by(() =>
		this.approvals.some((a) => this.wharf?.session && a.equals(this.wharf?.session.permissionLevel))
	);

	constructor(network: NetworkState, proposal: Proposal) {
		this.network = network;
		this.proposal = proposal;
	}

	sync(network: NetworkState, wharf: WharfState) {
		let changed = false;
		if (network.chain != this.network?.chain) {
			this.network = network;
			changed = true;
		}

		if (changed) {
			this.error = '';
		}

		if (wharf !== this.wharf) {
			this.wharf = wharf;
		}
	}

	accountHasApproved = (account?: PermissionLevel) => {
		if (!account) return false;
		return this.proposal.approvals.provided_approvals.some((a) => a.equals(account));
	};

	async transact(action: AnyAction) {
		try {
			if (!this.wharf) {
				throw new Error("Can't sign, wharf not ready");
			}

			this.transacting = true;

			const result = await this.wharf.transact({ action });

			const txid = result.response?.transaction_id;
			if (!txid) {
				throw Error('No transaction id');
			}
		} catch (e) {
			this.error = String(e);
		} finally {
			this.transacting = false;
			invalidateAll(); // Re-runs the load function to refresh table data
		}
	}

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

		await this.transact(action);
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

		await this.transact(action);
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

		this.transact(action);
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

		this.transact(action);
	}

	toJSON() {
		return {
			approvals: this.approvals,
			proposalExpired: this.proposalExpired,
			totalRequested: this.totalRequested,
			totalApproved: this.totalApproved,
			ratioApproved: this.ratioApproved,
			relativeTimeToExpiry: this.relativeTimeToExpiry,
			userHasApproved: this.userHasApproved,
			userIsProposer: this.userIsProposer,
			userIsApprover: this.userIsApprover,
			network: this.network,
			proposal: this.proposal,
			error: this.error
		};
	}
}
