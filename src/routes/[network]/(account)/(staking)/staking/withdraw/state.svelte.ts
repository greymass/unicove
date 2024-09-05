import { Asset } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';

import type { UnstakingRecord } from '../utils';
import {
	defaultQuantity,
	getUnstakingBalances,
	getClaimableBalance,
	getWithdrawableBalance
} from '../utils';

export class WithdrawState {
	public network: NetworkState | undefined = $state();
	public account: AccountState | undefined = $state();
	public wharf: WharfState | undefined = $state();

	public error: string = $state('');
	public txid: string = $state('');

	public unstaking: Array<UnstakingRecord> = $derived(
		this.account && this.network ? getUnstakingBalances(this.network, this.account) : []
	);
	public claimable: Asset = $derived(
		this.account && this.network
			? getClaimableBalance(this.network, this.account, this.unstaking)
			: defaultQuantity
	);
	public withdrawable: Asset = $derived(
		this.account && this.network
			? getWithdrawableBalance(this.network!, this.account)
			: defaultQuantity
	);
	public total: Asset = $derived(
		this.network
			? Asset.fromUnits(
					this.claimable.units.adding(this.withdrawable.units),
					this.network.chain.systemToken!.symbol
				)
			: defaultQuantity
	);

	constructor(network: NetworkState) {
		this.network = network;
	}

	sync(network: NetworkState, account: AccountState, wharf: WharfState) {
		let changed = false;
		if (network.chain != this.network?.chain) {
			this.network = network;
			changed = true;
		}
		if (account?.name !== this.account?.name) {
			this.account = account;
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

	async transact() {
		const actions = [];
		if (this.claimable) {
			actions.push(
				this.network!.contracts.system.action('sellrex', {
					from: this.account!.name!,
					rex: this.network!.tokenToRex(this.claimable)
				})
			);
		}
		actions.push(
			this.network!.contracts.system.action('withdraw', {
				owner: this.account!.name!,
				amount: this.withdrawable!
			})
		);

		try {
			const result = await this.wharf!.transact({
				actions
			});

			this.txid = String(result?.response?.transaction_id);
			if (!this.txid) {
				this.error = 'no txid';
			}
			console.log(`txid: ${this.txid}`);
		} catch (error) {
			this.error = String(error);
		}
	}
}
