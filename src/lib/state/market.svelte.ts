import { Asset, Serializer, TimePointSec } from '@wharfkit/antelope';

import { TokenDataSources, TokenPair } from '$lib/types/token';
import { TokenDefinition } from '$lib/types/token';
import { Currencies, ramKb } from '$lib/types/currencies';

import type { NetworkState } from './network.svelte';
import type { SettingsState } from './settings.svelte';

export class MarketState {
	private sources: TokenDataSources = $state() as TokenDataSources;

	public refreshed: TimePointSec = TimePointSec.from(new Date());

	readonly settings = $state() as SettingsState;
	readonly network = $state() as NetworkState;

	readonly pairs = $derived([
		...this.sources.pairs,
		...this.sources.pairs.map((pair) => pair.reversed)
	]);

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
		const response = await this.network.fetch(`/${this.network}/api/pairs/${encoded}`);
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
		return this.pairs.find((pair) => {
			const matchBase = TokenDefinition.from(pair.base).equals(TokenDefinition.from(base));
			const matchQuote = TokenDefinition.from(pair.quote).equals(TokenDefinition.from(quote));
			return matchBase && matchQuote;
		});
	}

	getRAMTokenPair(quote: TokenDefinition): TokenPair | undefined {
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
		const pair = this.pairs.find((pair) => {
			const matchBase = TokenDefinition.from(pair.base).equals(this.network.token.id);
			const matchQuote = TokenDefinition.from(pair.quote).equals(TokenDefinition.from(quote));
			return matchBase && matchQuote;
		});
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
