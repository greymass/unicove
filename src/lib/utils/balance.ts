import { Asset } from '@wharfkit/antelope';

import {
	TokenBalance,
	TokenBalanceValue,
	TokenDefinition,
	ZeroUnits,
	tokenEquals
} from '$lib/types/token';
import type { MarketState } from '$lib/state/market.svelte';
import type { NetworkState } from '$lib/state/network.svelte';

export function getNonSystemTokenBalances(
	network: NetworkState,
	market: MarketState,
	currency: TokenDefinition,
	balances: TokenBalance[]
): TokenBalanceValue[] {
	return balances
		.filter((item) => {
			const hasBalance = item.balance.units.gt(ZeroUnits);
			const isSystemToken = tokenEquals(item.token.id, network.token.id);
			const isLegacyToken =
				network.config.legacytoken && tokenEquals(item.token.id, network.config.legacytoken.id);
			const isRAMToken = tokenEquals(item.token.id, network.getRamToken().id);
			return hasBalance && !isSystemToken && !isLegacyToken && !isRAMToken;
		})
		.map((item) => {
			const pair = market.getPair(item.token.id, currency);
			if (pair) {
				return TokenBalanceValue.from({
					...item,
					token: {
						...item.token,
						// Merge media from token and pair
						media: {
							...item.token.media,
							...pair.base.media
						}
					},
					value: market.value(item.token.id, currency, item.balance)
				});
			} else {
				return TokenBalanceValue.from({
					...item,
					value: Asset.fromUnits(0, currency.symbol)
				});
			}
		})
		.sort((a, b) => (a.value.units.gt(b.value.units) ? -1 : 1));
}
