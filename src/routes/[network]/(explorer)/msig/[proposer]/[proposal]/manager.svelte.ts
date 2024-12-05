import { invalidateAll } from '$app/navigation';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import { Name, PermissionLevel, type Checksum256 } from '@wharfkit/antelope';
import type { AnyAction } from '@wharfkit/session';

type Proposal = {
	proposer: string;
	name: string;
	hash: Checksum256;
	approvals: {
		provided_approvals: PermissionLevel[];
	};
};

export class ApprovalManager {
	network: NetworkState | undefined = $state();
	wharf: WharfState | undefined = $state();
	proposal: Proposal;
	error?: string = $state();
	transacting = $state(false);
	approved = $state(false);

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

			if (wharf.session) {
				const permissionLevel = wharf.session.permissionLevel;
				this.approved = this.proposal.approvals.provided_approvals.some((a: PermissionLevel) =>
					a.equals(permissionLevel)
				);
			}
		}
	}

	async transact(action: AnyAction) {
		try {
			this.transacting = true;

			if (!this.wharf) {
				throw new Error("Can't sign, wharf not ready");
			}

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
		this.approved = true;
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
		this.approved = false;
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
}
