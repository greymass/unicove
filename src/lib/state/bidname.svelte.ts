import { BlockTimestamp, type NameType } from '@wharfkit/antelope';

import { Types } from '$lib/wharf/contracts/system';
import type { NetworkState } from './network.svelte';

export class BidnameState {
	topBids: Types.name_bid[] = $state([]);
	lastNameClose: BlockTimestamp | undefined = $state(undefined);
	loading = $state(false);
	error: string | undefined = $state(undefined);

	leadingBid = $derived(this.topBids[0]);

	private network: NetworkState;

	constructor(network: NetworkState) {
		this.network = network;
	}

	async fetchTopBids(limit = 10): Promise<void> {
		this.loading = true;
		this.error = undefined;
		try {
			const eosio = this.network.contracts.eosio;
			const [topBids, globalState] = await Promise.all([
				eosio
					.table('namebids')
					.query({
						index_position: 'secondary',
						key_type: 'i64',
						from: '9223372036854775808',
						maxRows: limit
					})
					.all(),
				eosio.table('global').get()
			]);
			this.topBids = topBids.filter((bid) => bid.high_bid.toNumber() > 0);
			if (globalState) {
				this.lastNameClose = globalState.last_name_close;
			}
		} catch (e) {
			this.error = String(e);
		} finally {
			this.loading = false;
		}
	}

	async lookupBid(name: NameType): Promise<Types.name_bid | undefined> {
		return this.network.contracts.eosio.table('namebids').get(name);
	}

	async fetchRefunds(name: NameType): Promise<Types.bid_refund[]> {
		return this.network.contracts.eosio.table('bidrefunds', name).all();
	}
}
