import { Action, Asset, type BlockTimestamp } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';
import type { WharfState } from '$lib/state/client/wharf.svelte';
import { Types } from '$lib/wharf/contracts/system';
import { BidnameState } from '$lib/state/bidname.svelte';
import { PlaceholderAuth } from '@wharfkit/session';
import { addTrackedName } from '../../tracked';

const DAY_MS = 24 * 60 * 60 * 1000;

export class BidManager {
	public network: NetworkState | undefined = $state();
	public account: AccountState | undefined = $state();
	public wharf: WharfState | undefined = $state();

	public bidName: string = $state('');
	public bidAmount: Asset = $state(Asset.fromUnits(0, '4,EOS'));
	public bidValid: boolean = $state(false);
	public currentBid: Types.name_bid | undefined = $state();
	public error: string = $state('');
	public txid: string = $state('');
	public loading: boolean = $state(false);

	public leadingBid: Types.name_bid | undefined = $state();
	public lastNameClose: BlockTimestamp | undefined = $state();

	private bidnameState: BidnameState | undefined;

	public minimumBid: Asset = $derived.by(() => {
		if (!this.network) return Asset.fromUnits(0, '4,EOS');
		const symbol = this.network.config.systemtoken.symbol;
		if (!this.currentBid) {
			return Asset.fromUnits(1, symbol);
		}
		const currentUnits = this.currentBid.high_bid.toNumber();
		const minimumUnits = Math.ceil(currentUnits * 1.1);
		return Asset.fromUnits(minimumUnits, symbol);
	});

	public canBid: boolean = $derived.by(() => {
		if (!this.bidValid || this.bidName.length === 0) return false;
		if (this.bidAmount.units.toNumber() < this.minimumBid.units.toNumber()) return false;
		return true;
	});

	public leadingBidAsset: Asset | undefined = $derived.by(() => {
		if (!this.leadingBid || !this.network) return undefined;
		return Asset.fromUnits(this.leadingBid.high_bid, this.network.config.systemtoken.symbol);
	});

	public wouldBecomeTopBid: boolean = $derived.by(() => {
		if (!this.leadingBid || !this.bidValid) return false;
		return this.bidAmount.units.toNumber() > this.leadingBid.high_bid.toNumber();
	});

	public auctionCloseTime: number = $derived.by(() => {
		if (!this.leadingBid) return 0;
		const bidEligible = this.leadingBid.last_bid_time.toMilliseconds() + DAY_MS;
		const closeEligible = this.lastNameClose
			? this.lastNameClose.toMilliseconds() + DAY_MS
			: 0;
		return Math.max(bidEligible, closeEligible);
	});

	constructor(network: NetworkState) {
		this.network = network;
		this.bidAmount = this.zeroValue;
		this.bidnameState = new BidnameState(network);
	}

	get zeroValue() {
		return this.network
			? Asset.fromUnits(0, this.network.config.systemtoken.symbol)
			: Asset.fromUnits(0, '4,EOS');
	}

	sync(network: NetworkState, account: AccountState, wharf: WharfState) {
		let changed = false;
		if (network.chain !== this.network?.chain) {
			this.network = network;
			this.bidnameState = new BidnameState(network);
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

		if (this.network && !this.bidAmount.symbol.equals(this.network.config.systemtoken.symbol)) {
			this.bidAmount = this.zeroValue;
		}

		if (wharf !== this.wharf) {
			this.wharf = wharf;
		}
	}

	async loadCurrentBid() {
		if (!this.bidName || !this.bidnameState) return;
		this.loading = true;
		try {
			this.currentBid = await this.bidnameState.lookupBid(this.bidName);
		} catch (e) {
			this.error = String(e);
		} finally {
			this.loading = false;
		}
	}

	async loadAuctionState() {
		if (!this.bidnameState) return;
		await this.bidnameState.fetchTopBids(1);
		this.leadingBid = this.bidnameState.leadingBid;
		this.lastNameClose = this.bidnameState.lastNameClose;
	}

	async transact() {
		try {
			if (!this.network || !this.account || !this.account.name || !this.wharf) {
				throw new Error("Can't sign, data not ready");
			}

			const action = Action.from({
				account: this.network.contracts.system.account,
				name: 'bidname',
				authorization: [PlaceholderAuth],
				data: Types.bidname.from({
					bidder: PlaceholderAuth.actor,
					newname: this.bidName,
					bid: this.bidAmount
				})
			});

			const result = await this.wharf.transact({
				actions: [action]
			});

			this.txid = String(result?.response?.transaction_id);
			if (!this.txid) {
				this.error = 'no txid';
			} else {
				addTrackedName(String(this.account.name), this.bidName);
			}
		} catch (error) {
			this.error = String(error);
		}
	}
}
