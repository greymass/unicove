import { TokenDataSources, TokenPair, Tokens } from '$lib/types/token';
import type { Token } from '$lib/types/token';
import type { NetworkState } from './network.svelte';

export class TokensState {
	private sources: TokenDataSources = $state() as TokenDataSources;

	readonly network: NetworkState = $state() as NetworkState;
	readonly prices: TokenPair[] = $state([]);
	readonly tokens: Token[] = $state([]);

	constructor(network: NetworkState) {
		this.network = network;
		this.sources = TokenDataSources.from({
			updated: new Date()
		});
		this.tokens = [network.token];
		this.prices = [
			TokenPair.from({
				base: network.token.meta.id,
				quote: Tokens.USD,
				price: network.token.price
			})
		];
	}

	toJSON() {
		return {
			prices: this.prices,
			sources: this.sources,
			tokens: this.tokens
		};
	}
}
