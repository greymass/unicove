import type { NetworkState } from '$lib/state/network.svelte';
import { localizePath } from './url';

export interface MarketPricePoint {
	date: string;
	value: number;
}

type MarketPriceResponse = MarketPricePoint[] | { error: string };

export async function loadMarketPrices(
	network: NetworkState,
	fetch: typeof globalThis.fetch,
	market: 'ram' | 'token'
): Promise<MarketPricePoint[]> {
	if (!network.supports('timeseries')) {
		return [];
	}
	const path = localizePath(`/api/metrics/marketprice/${market}`);
	try {
		const response = await fetch(path);
		const parsed: MarketPriceResponse = await response.json();
		if (Array.isArray(parsed)) {
			return parsed;
		}
		throw new Error(String(parsed.error));
	} catch (error) {
		console.warn(`Market price history unavailable (${path})`, error);
		return [];
	}
}
