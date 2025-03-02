import { Asset, TimePointSec } from '@wharfkit/antelope';

import { TokenDataSources, TokenPair } from '$lib/types/token';
import { TokenDefinition } from '$lib/types/token';
import { ramKb } from '$lib/types/currencies';

import type { NetworkState } from './network.svelte';
import type { SettingsState } from './settings.svelte';

export class MarketState {
	private sources: TokenDataSources = $state() as TokenDataSources;

	public refreshed: TimePointSec = TimePointSec.from(new Date());

	readonly settings = $state() as SettingsState;
	readonly network = $state() as NetworkState;

	readonly pairs = $derived(deriveAdditionalPairs(this.sources.pairs));

	constructor(network: NetworkState, settings: SettingsState) {
		this.network = network;
		this.settings = settings;

		this.sources = TokenDataSources.from({
			ts: new Date(),
			pairs: []
		});
	}

	public async refresh() {
		const response = await this.network.fetch(`/${this.network}/api/pairs`);
		if (response.ok) {
			const json = await response.json();
			const pairs = json.pairs.map((pair: typeof TokenPair) => TokenPair.from(pair));
			pairs.push(
				TokenPair.from({
					base: ramKb,
					quote: this.network.token.id,
					price: this.network.resources.ram.price.rammarket,
					updated: this.network.connection.updated
				})
			);
			this.sources = TokenDataSources.from({
				pairs,
				ts: new Date(json.ts)
			});
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

export function deriveAdditionalPairs(pairs: TokenPair[]): TokenPair[] {
	const derived: TokenPair[] = [...pairs];

	// Add any pairs that can be derived from the existing pairs (e.g. EOS/BTC -> BTC/CNY = EOS/CNY)
	// TODO: Refactor for better recursion
	for (const pair of pairs) {
		const derivablePairs = pairs.filter((p) => p.base.equals(pair.quote));
		for (const possiblePair of derivablePairs) {
			const exists = !!pairs.find(
				(p) => p.base.equals(pair.base) && p.quote.equals(possiblePair.quote)
			);
			if (!exists) {
				const pairDate = pair.updated.toDate();
				const possiblePairDate = possiblePair.updated.toDate();
				const updated = pairDate < possiblePairDate ? pairDate : possiblePairDate;
				derived.push(
					TokenPair.from({
						base: pair.base,
						quote: possiblePair.quote,
						// Use floats since precision lengths can be mixed
						price: Asset.fromFloat(
							Number(pair.price.value) * Number(possiblePair.price.value),
							possiblePair.quote.symbol
						),
						updated
					})
				);
			}
		}
	}

	// Continue to derive pairs until no new pairs are found
	if (pairs.length !== derived.length) {
		const more = deriveAdditionalPairs(derived);
		if (more.length !== derived.length) {
			return more;
		}
	}
	return derived;
}
