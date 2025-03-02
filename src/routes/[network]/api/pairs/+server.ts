import { json, type RequestEvent } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';
import type { NetworkState } from '$lib/state/network.svelte';
import { TokenDataSources, TokenDefinition, TokenPair } from '$lib/types/token';
import { Asset, TimePointSec } from '@wharfkit/session';

export async function GET({ locals: { network } }: RequestEvent) {
	const pairs = await delphioracle(network);
	return json(
		TokenDataSources.from({
			ts: new Date(),
			pairs
		}),
		{
			headers: getCacheHeaders(3600)
		}
	);
}

async function delphioracle(network: NetworkState): Promise<TokenPair[]> {
	const rows = await network.contracts.delphioracle.table('pairs').all();
	const pairs: TokenPair[] = [];
	for (const pair of rows.filter((pair) => pair.active)) {
		const latest = await network.contracts.delphioracle.table('datapoints', pair.name).get();
		if (latest && latest.timestamp) {
			const updated = latest.timestamp.toDate();
			// Skip prices older than 24hrs
			if (Number(updated) < new Date().getTime() - 1000 * 60 * 60 * 24) {
				continue;
			}
			const quoteSymbol = Asset.Symbol.from(`${pair.quoted_precision},${pair.quote_symbol.code}`);
			pairs.push(
				TokenPair.from({
					base: TokenDefinition.from({
						symbol: pair.base_symbol,
						contract: !pair.base_contract.equals('') ? pair.base_contract : undefined,
						chain: !pair.base_contract.equals('') ? network.chain.id : undefined
					}),
					quote: TokenDefinition.from({
						symbol: quoteSymbol,
						contract: !pair.quote_contract.equals('') ? pair.quote_contract : undefined,
						chain: !pair.quote_contract.equals('') ? network.chain.id : undefined
					}),
					price: Asset.fromUnits(latest.median, quoteSymbol),
					updated: TimePointSec.from(updated)
				})
			);
		}
	}
	return pairs;
}
