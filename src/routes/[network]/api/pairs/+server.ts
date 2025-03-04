import { json, type RequestEvent } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';
import type { NetworkState } from '$lib/state/network.svelte';
import { TokenDataSources, TokenDefinition, TokenPair } from '$lib/types/token';
import { Asset, Chains, TimePointSec } from '@wharfkit/session';
import { Currencies, ramKb } from '$lib/types/currencies';

export async function GET({ fetch, locals: { network } }: RequestEvent) {
	const pairs: TokenPair[] = [];
	const currency = await fetch(`/${network}/api/currency/usd`);
	if (currency.ok) {
		const fiat = await currency.json();
		pairs.push(...fiat.pairs.map((pair: TokenPair) => TokenPair.from(pair)));
	}

	// Push RAM token pair
	pairs.push(
		TokenPair.from({
			base: ramKb,
			quote: network.token.id,
			price: network.resources.ram.price.rammarket,
			updated: network.connection.updated
		})
	);
	// Push BRAM token pair
	pairs.push(
		TokenPair.from({
			base: TokenDefinition.from({
				symbol: '0,BRAM',
				contract: 'ram.defi',
				chain: network.chain.id
			}),
			quote: network.token.id,
			price: Asset.fromUnits(
				network.resources.ram.price.rammarket.units.dividing(1000),
				network.token.symbol
			),
			updated: network.connection.updated
		})
	);
	// Push WRAM token pair
	pairs.push(
		TokenPair.from({
			base: TokenDefinition.from({
				symbol: '0,WRAM',
				contract: 'eosio.wram',
				chain: network.chain.id
			}),
			quote: network.token.id,
			price: Asset.fromUnits(
				network.resources.ram.price.rammarket.units.dividing(1000),
				network.token.symbol
			),
			updated: network.connection.updated
		})
	);

	if (network.supports('delphihelper')) {
		pairs.push(...(await delphihelper(network)));
	} else if (network.supports('delphioracle')) {
		pairs.push(...(await delphioracle(network)));
	}

	const derived = deriveAdditionalPairs(pairs);
	return json(
		TokenDataSources.from({
			ts: new Date(),
			pairs: derived
		}),
		{
			headers: getCacheHeaders(300)
		}
	);
}

function tokenEquals(first: TokenDefinition, second: TokenDefinition) {
	return (
		String(first.chain) === String(second.chain) &&
		String(first.contract) === String(second.contract) &&
		String(first.symbol) === String(second.symbol)
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

async function delphihelper(network: NetworkState): Promise<TokenPair[]> {
	const rows = await network.contracts.delphihelper.readonly('getpairs');
	const pairs = [];
	for (const pair of rows) {
		// Skip prices older than 24hrs
		const updated = pair.updated.toDate();
		if (Number(updated) < new Date().getTime() - 1000 * 60 * 60 * 24) {
			continue;
		}
		pairs.push(
			TokenPair.from({
				...pair,
				base: TokenDefinition.from({
					symbol: pair.base.symbol,
					contract: pair.base.contract.equals('') ? undefined : pair.base.contract,
					chain: pair.base.contract.equals('') ? undefined : network.chain.id
				}),
				quote: TokenDefinition.from({
					symbol: pair.quote.symbol,
					contract: pair.quote.contract.equals('') ? undefined : pair.quote.contract,
					chain: pair.quote.contract.equals('') ? undefined : network.chain.id
				})
			})
		);
	}
	return pairs;
}

const USDT = TokenDefinition.from({
	symbol: '4,USDT',
	contract: 'tethertether',
	chain: Chains.EOS.id
});

const mappings = [
	{
		original: Currencies.USD,
		variants: [USDT]
	}
];

function findMatchingBasePairs(pairs: TokenPair[], base: TokenDefinition): TokenPair[] {
	const matches = pairs.filter((pair) => tokenEquals(pair.base, base));
	const mapping = mappings.find((mapping) => tokenEquals(mapping.original, base));
	if (mapping) {
		for (const variant of mapping.variants) {
			const match = pairs.find((pair) => tokenEquals(pair.base, variant));
			if (match) {
				matches.push(match);
			}
		}
	}
	return matches;
}

function deriveAdditionalPairs(pairs: TokenPair[]): TokenPair[] {
	const derived = [...pairs];

	// Add any pairs that can be derived from the existing pairs (e.g. EOS/BTC -> BTC/CNY = EOS/CNY)
	// TODO: Refactor for better recursion
	for (const pair of pairs) {
		const derivablePairs = findMatchingBasePairs(pairs, pair.quote);
		for (const possiblePair of derivablePairs) {
			const exists = !!pairs.find(
				(p) => tokenEquals(p.base, pair.base) && tokenEquals(p.quote, possiblePair.quote)
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

	// Recurse one level deep to derive additional pairs
	if (pairs.length !== derived.length) {
		const more = deriveAdditionalPairs(derived);
		if (more.length !== derived.length) {
			return more;
		}
	}

	// Check for any missing reversed pairs
	for (const pair of derived) {
		// Skip any reverse pairs without a value
		if (!pair.price.value) {
			continue;
		}
		const exists = pairs.find(
			(p) => tokenEquals(p.base, pair.quote) && tokenEquals(p.quote, pair.base)
		);
		if (!exists) {
			derived.push(pair.reversed);
		}
	}

	return derived;
}
