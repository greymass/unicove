import { Asset } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import AssetInput from '$lib/components/input/asset.svelte';

import {
	defaultQuantity,
	getStakableBalance,
	getAPR,
	getUnstakableBalance
} from '$lib/utils/staking';
import { TokenBalance, TokenDefinition } from '$lib/types/token';

export class StakeManager {
	public input: AssetInput | undefined = $state();
	public network: NetworkState | undefined = $state();
	public account: AccountState | undefined = $state();
	public wharf: WharfState | undefined = $state();

	public assetValue: Asset = $state(defaultQuantity);
	public minValue = $state(0);
	public maxValue = $state(0);

	public assetValid = $state(false);
	public assetValidPrecision = $state(true);
	public assetValidMinimum = $state(true);
	public assetValidMaximum = $state(true);

	public error: string = $state('');
	public txid: string = $state('');

	public staked: Asset = $derived(getUnstakableBalance(this.network, this.account));
	public stakable: Asset = $derived(getStakableBalance(this.network, this.account));
	public apr: string = $derived(this.network ? getAPR(this.network) : '0');
	public estimateYield: Asset = $derived(
		this.network
			? Asset.from(
					(this.assetValue.value * parseFloat(this.apr)) / 100,
					this.network.chain.systemToken!.symbol
				)
			: defaultQuantity
	);
	public tokenBalance: TokenBalance | undefined = $derived.by(() => {
		let balance: TokenBalance | undefined = undefined;
		if (this.network) {
			const id = TokenDefinition.from({
				chain: this.network.chain.id,
				contract: this.network.contracts.token.account,
				symbol: this.network.chain.systemToken!.symbol
			});
			const meta = (this.network.tokens || []).find((item) => item.id.equals(id));
			if (meta) {
				balance = TokenBalance.from({
					balance: this.staked,
					token: {
						id,
						contract: this.network.contracts.token.account
					}
				});
			}
		}
		return balance;
	});

	constructor(network: NetworkState) {
		this.network = network;
		this.assetValue = this.zeroValue;
	}

	get zeroValue() {
		return this.network ? Asset.from(0, this.network.chain.systemToken!.symbol) : defaultQuantity;
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

		if (this.network && !this.assetValue.symbol.equals(this.network.chain.systemToken!.symbol)) {
			this.input?.set(this.zeroValue);
		}
		if (wharf !== this.wharf) {
			this.wharf = wharf;
		}

		if (this.network) {
			this.minValue = Asset.fromUnits(1, this.network.chain.systemToken!.symbol).value;
			this.maxValue = this.account ? getStakableBalance(this.network, this.account).value : 0;
		}
	}

	setMaxValue() {
		this.input?.set(this.stakable);
	}

	async transact() {
		try {
			if (!this.network || !this.account || !this.account.name || !this.wharf || !this.assetValue) {
				throw new Error("Can't sign, data not ready");
			}

			const deposit = this.network.contracts.system.action('deposit', {
				owner: this.account.name,
				amount: this.assetValue
			});
			const buyrex = this.network.contracts.system.action('buyrex', {
				from: this.account.name,
				amount: this.assetValue
			});

			const result = await this.wharf.transact({
				actions: [deposit, buyrex]
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
