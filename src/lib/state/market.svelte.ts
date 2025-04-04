import { Asset, Serializer, TimePointSec, UInt64 } from '@wharfkit/antelope';

import { TokenDataSources, tokenEquals, TokenPair, TokenSwap } from '$lib/types/token';
import { TokenDefinition } from '$lib/types/token';
import { Currencies } from '$lib/types/currencies';

import type { NetworkState } from './network.svelte';
import type { SettingsState } from './settings.svelte';

export class MarketState {
	private sources: TokenDataSources = $state() as TokenDataSources;

	public refreshed: TimePointSec = $state(TimePointSec.fromInteger(0));
	readonly loaded = $derived(this.refreshed.value.gt(UInt64.from(0)));

	readonly settings = $state() as SettingsState;
	readonly network = $state() as NetworkState;

	readonly pairs = $derived([
		...this.sources.pairs,
		...this.sources.pairs.map((pair) => pair.reversed)
	]);

	readonly swaps = $derived(getSwaps(this.network, this.pairs));

	constructor(network: NetworkState, settings: SettingsState) {
		this.network = network;
		this.settings = settings;

		this.sources = TokenDataSources.from({
			ts: new Date(),
			pairs: []
		});
	}

	public async refresh() {
		const basePair = Currencies[this.settings.data.displayCurrency];
		const encoded = Serializer.encode({ object: basePair });
		let url = `/${this.network}/api/pairs/${encoded}`;
		if (this.settings.data.mockPrice) {
			// Allow mock data for prices to be passed for testing
			url += `?mock=${Asset.fromUnits(12345, basePair.symbol)}`;
		}
		const response = await this.network.fetch(url);
		if (response.ok) {
			const json = await response.json();
			this.sources = TokenDataSources.from(json);
			this.refreshed = TimePointSec.from(new Date());
		}
	}

	value(base: TokenDefinition, quote: TokenDefinition, balance: Asset): Asset {
		const pair = this.getPair(base, quote);
		if (!pair) {
			return Asset.fromUnits(0, quote.symbol);
		}
		// Use floats since precision lengths can be mixed
		return Asset.fromFloat(Number(pair.price.value) * Number(balance.value), quote.symbol);
	}

	getPair(base: TokenDefinition, quote: TokenDefinition): TokenPair | undefined {
		return this.pairs.find((p) => tokenEquals(p.base.id, base) && tokenEquals(p.quote.id, quote));
	}

	getSwap(base: TokenDefinition, quote: TokenDefinition): TokenSwap | undefined {
		const swap = this.swaps.find(
			(swap) => tokenEquals(swap.pair.base.id, base) && tokenEquals(swap.pair.quote.id, quote)
		);
		if (swap) {
			return swap;
		}
	}

	getRAMTokenPair(quote: TokenDefinition): TokenPair | undefined {
		const ramKb = this.network.getRamTokenDefinition();
		const pair = this.pairs.find((pair) => {
			const matchBase = TokenDefinition.from(pair.base).equals(ramKb);
			const matchQuote = TokenDefinition.from(pair.quote).equals(TokenDefinition.from(quote));
			return matchBase && matchQuote;
		});
		if (!pair) {
			return TokenPair.from({
				base: ramKb,
				quote,
				price: Asset.fromUnits(0, quote.symbol),
				updated: new Date()
			});
		}
		return pair;
	}

	getSystemTokenPair(quote: TokenDefinition): TokenPair | undefined {
		const pair = this.pairs.find(
			(p) => tokenEquals(p.base.id, this.network.token.id) && tokenEquals(p.quote.id, quote)
		);
		if (!pair) {
			return TokenPair.from({
				base: this.network.token.id,
				quote,
				price: Asset.fromUnits(0, quote.symbol),
				updated: new Date()
			});
		}
		return pair;
	}

	getPairs(token: TokenDefinition): TokenPair[] {
		return this.pairs.filter((pair) => {
			return TokenDefinition.from(pair.base).equals(TokenDefinition.from(token));
		});
	}

	toJSON() {
		return {
			pairs: this.pairs
		};
	}
}

function getSwaps(network: NetworkState, pairs: TokenPair[]): TokenSwap[] {
	const swaps: TokenSwap[] = [];
	if (network.legacytoken) {
		const { token, legacytoken } = network;

		const legacyPair = pairs.find(
			(pair) => tokenEquals(pair.base.id, legacytoken.id) && tokenEquals(pair.quote.id, token.id)
		);
		if (legacyPair) {
			swaps.push(
				TokenSwap.from({
					pair: legacyPair,
					contract: network.token.contract,
					action: 'transfer',
					fee: Asset.fromUnits(0, network.token.symbol)
				})
			);
		}

		const newPair = pairs.find(
			(pair) => tokenEquals(pair.base.id, token.id) && tokenEquals(pair.quote.id, legacytoken.id)
		);
		if (newPair) {
			swaps.push(
				TokenSwap.from({
					pair: newPair,
					contract: network.token.contract,
					action: 'transfer',
					fee: Asset.fromUnits(0, network.legacytoken.symbol)
				})
			);
		}
	}
	return swaps;
}
