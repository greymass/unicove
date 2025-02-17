import { Asset, UInt64 } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';

import type { UnstakingRecord } from '$lib/utils/staking';
import {
	defaultQuantity,
	getUnstakingBalances,
	getClaimableBalance,
	getWithdrawableBalance,
	getSellableREX
} from '$lib/utils/staking';

export class WithdrawManager {
	public network: NetworkState | undefined = $state();
	public account: AccountState | undefined = $state();
	public wharf: WharfState | undefined = $state();

	public error: string = $state('');
	public txid: string = $state('');

	public unstaking: Array<UnstakingRecord> = $derived(
		getUnstakingBalances(this.network, this.account)
	);
	public claimable: Asset = $derived(
		getClaimableBalance(this.network, this.account, this.unstaking)
	);
	public sellable: Asset = $derived(getSellableREX(this.network, this.account, this.unstaking));
	public withdrawable: Asset = $derived(getWithdrawableBalance(this.network, this.account));
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
		if (this.account !== account) {
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
		try {
			if (!this.network || !this.account || !this.account.name || !this.wharf) {
				throw new Error("Can't sign, data not ready");
			}

			const actions = [];
			if (this.sellable && this.sellable.units.gt(UInt64.from(0))) {
				actions.push(
					this.network.contracts.system.action('sellrex', {
						from: this.account.name,
						rex: this.sellable
					})
				);
			}
			if (this.total) {
				actions.push(
					this.network.contracts.system.action('withdraw', {
						owner: this.account.name,
						amount: this.total
					})
				);
			}

			const result = await this.wharf.transact({
				actions
			});

			this.txid = String(result?.response?.transaction_id);
			if (!this.txid) {
				this.error = 'no txid';
			}
		} catch (error) {
			this.error = String(error);
		}
	}
}
