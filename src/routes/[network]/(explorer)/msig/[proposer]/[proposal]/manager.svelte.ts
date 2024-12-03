import type { WharfState } from '$lib/state/client/wharf.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import { Name, type Checksum256 } from '@wharfkit/antelope';

type Proposal = {
	proposer: string;
	name: string;
	hash: Checksum256;
};

export class ApprovalManager {
	network: NetworkState | undefined = $state();
	wharf: WharfState | undefined = $state();
	proposal: Proposal;
	error?: string = $state();
	txid?: string = $state();

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
			this.txid = '';
		}

		if (wharf !== this.wharf) {
			this.wharf = wharf;
		}
	}

	async approve() {
		try {
			if (!this.network || !this.wharf || !this.wharf.session) {
				throw new Error("Can't sign, data not ready");
			}
			const action = this.network.contracts.msig.action('approve', {
				proposer: Name.from(this.proposal.proposer),
				proposal_name: Name.from(this.proposal.name),
				level: this.wharf.session.permissionLevel,
				proposal_hash: this.proposal.hash
			});

			const result = await this.wharf.transact({ action });

			this.txid = result.response?.transaction_id;
			if (!this.txid) {
				throw Error('No transaction id');
			}
		} catch (e) {
			this.error = String(e);
		}
	}

	async unapprove() {
		try {
			if (!this.network || !this.wharf || !this.wharf.session) {
				throw new Error("Can't sign, data not ready");
			}
			const action = this.network.contracts.msig.action('unapprove', {
				proposer: Name.from(this.proposal.proposer),
				proposal_name: Name.from(this.proposal.name),
				level: this.wharf.session.permissionLevel
			});

			const result = await this.wharf.transact({ action });

			this.txid = result.response?.transaction_id;
			if (!this.txid) {
				throw Error('No transaction id');
			}
		} catch (e) {
			this.error = String(e);
		}
	}

	async execute() {
		try {
			if (!this.network || !this.wharf || !this.wharf.session) {
				throw new Error("Can't sign, data not ready");
			}
			const action = this.network.contracts.msig.action('exec', {
				proposer: Name.from(this.proposal.proposer),
				proposal_name: Name.from(this.proposal.name),
				executer: this.wharf.session.actor
			});

			const result = await this.wharf.transact({ action });

			this.txid = result.response?.transaction_id;
			if (!this.txid) {
				throw Error('No transaction id');
			}
		} catch (e) {
			this.error = String(e);
		}
	}
}
