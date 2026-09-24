import type { PageLoad } from './$types';
import { loadMarketPrices } from '$lib/utils/marketprice';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { network } = await parent();

	return {
		ramPrices: await loadMarketPrices(network, fetch, 'ram')
	};
};
