import type { PublicKey } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import { Types } from '$lib/wharf/contracts/system';

export class ClaimManager {
	public network: NetworkState | undefined = $state();
	public account: AccountState | undefined = $state();
	public wharf: WharfState | undefined = $state();

	public bidName: string = $state('');
	public ownerKey: PublicKey | undefined = $state();
	public activeKey: PublicKey | undefined = $state();
	public currentBid: Types.name_bid | undefined = $state();
	public loading: boolean = $state(false);
	public error: string = $state('');
	public txid: string = $state('');

	public isWon: boolean = $derived(!!this.currentBid && this.currentBid.high_bid.toNumber() < 0);

	public isHighBidder: boolean = $derived(
		!!this.currentBid && !!this.account && this.currentBid.high_bidder.equals(this.account.name)
	);

	public canClaim: boolean = $derived(
		this.isWon && this.isHighBidder && !!this.ownerKey && !!this.activeKey
	);

	constructor(network: NetworkState) {
		this.network = network;
	}

	sync(network: NetworkState, account: AccountState, wharf: WharfState) {
		let changed = false;
		if (network.chain !== this.network?.chain) {
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

	async loadBid() {
		if (!this.network || !this.bidName) return;

		this.loading = true;
		this.error = '';
		try {
			this.currentBid = await this.network.contracts.eosio.table('namebids').get(this.bidName);
		} catch (e) {
			this.error = String(e);
		} finally {
			this.loading = false;
		}
	}

	async transact() {
		try {
			if (
				!this.network ||
				!this.account ||
				!this.account.name ||
				!this.wharf ||
				!this.ownerKey ||
				!this.activeKey
			) {
				throw new Error("Can't sign, data not ready");
			}

			const contract = this.network.contracts.system;

			const newaccount = contract.action('newaccount', {
				creator: this.account.name,
				name: this.bidName,
				owner: {
					threshold: 1,
					keys: [{ key: this.ownerKey, weight: 1 }],
					accounts: [],
					waits: []
				},
				active: {
					threshold: 1,
					keys: [{ key: this.activeKey, weight: 1 }],
					accounts: [],
					waits: []
				}
			});

			const buyrambytes = contract.action('buyrambytes', {
				payer: this.account.name,
				receiver: this.bidName,
				bytes: 1500
			});

			const result = await this.wharf.transact({
				actions: [newaccount, buyrambytes]
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
