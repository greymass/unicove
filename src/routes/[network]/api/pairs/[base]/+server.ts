import { getCacheHeaders } from '$lib/utils';
import { TokenDataSources, TokenDefinition, tokenEquals, TokenPair } from '$lib/types/token';
import { Asset, Serializer } from '@wharfkit/session';
import type { RequestEvent } from './$types';
import { json } from '@sveltejs/kit';

export async function GET({ fetch, locals: { network }, params, url }: RequestEvent) {
	let basePair: TokenDefinition;
	try {
		basePair = Serializer.decode({ data: params.base, type: TokenDefinition });
	} catch (error) {
		return json({ error: String(error) }, { status: 400 });
	}
	// Allow mock data for prices to be passed for testing
	const mockPrice = url.searchParams.get('mock');
	let pairsUrl = `/${network}/api/pairs`;
	if (mockPrice) {
		pairsUrl += `?mock=${Asset.from(mockPrice)}`;
	}
	const response = await fetch(pairsUrl);
	if (!response.ok) {
		return json({ error: 'Failed to fetch pairs' }, { status: 500 });
	}
	const data = await response.json();
	const pairs = data.pairs.filter((pair: TokenPair) => tokenEquals(pair.base, basePair));
	if (tokenEquals(basePair, network.token.id)) {
		network.config.systemtokenalt.forEach((altSymbol: Asset.Symbol) => {
			const altPair = TokenDefinition.from({
				symbol: altSymbol
			});
			const newPairs = data.pairs.filter((pair: TokenPair) => tokenEquals(pair.base, altPair));
			pairs.push(...newPairs);
		});
	}
	return json(
		TokenDataSources.from({
			ts: new Date(),
			mockPrice,
			pairs
		}),
		{
			headers: getCacheHeaders(300)
		}
	);
}
