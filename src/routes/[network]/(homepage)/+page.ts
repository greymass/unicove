import type { PageLoad } from './$types';
import type { HistoricalPrice } from '$lib/types';
import { Asset } from '@wharfkit/antelope';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { network } = await parent();
	let ramPrices: HistoricalPrice[] = [];
	let tokenPrices: HistoricalPrice[] = [];

	const ramResponse: Response = await fetch(`/${network}/api/metrics/marketprice/ram`);
	const parsedRamResponse: { date: string; value: number }[] | { error: string } =
		await ramResponse.json();
	if ('error' in parsedRamResponse && parsedRamResponse.error) {
		throw new Error(String(parsedRamResponse.error));
	} else if (Array.isArray(parsedRamResponse)) {
		ramPrices = parsedRamResponse.map((price: { date: string; value: number }) => ({
			date: new Date(price.date),
			value: Asset.from(price.value / 10000, network.chain.systemToken?.symbol || '0,UNKNOWN')
		}));
	}

	const tokenResponse: Response = await fetch(`/${network}/api/metrics/marketprice/token`);
	const parsedTokenResponse: { date: string; value: number }[] | { error: string } =
		await tokenResponse.json();
	if ('error' in parsedTokenResponse && parsedTokenResponse.error) {
		throw new Error(String(parsedTokenResponse.error));
	} else if (Array.isArray(parsedTokenResponse)) {
		tokenPrices = parsedTokenResponse.map((price: { date: string; value: number }) => ({
			date: new Date(price.date),
			value: Asset.from(price.value / 10000, '4,USD')
		}));
	}

	return {
		ramPrices,
		tokenPrices
	};
};
