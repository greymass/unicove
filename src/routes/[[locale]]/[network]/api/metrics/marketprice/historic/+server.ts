import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { calculateValue, getCacheHeaders } from '$lib/utils';
import type { NetworkState } from '$lib/state/network.svelte';
import { Asset } from '@wharfkit/session';
import { Currencies } from '$lib/types/currencies';
import { TokenHistoricPrice, TokenHistoricPrices } from '$lib/types/token';

export const GET: RequestHandler = async ({ locals: { network } }) => {
	try {
		const systemTokenPair = `${network.token.symbol.name}usd`.toLowerCase();
		const systemRamPair = `ram`;

		if (!network.config.endpoints.metrics) {
			return json({
				systemtoken: {},
				ram: {}
			});
		}

		const [systemtoken, ramsystemtoken] = await Promise.all([
			getHistoricPrices(network, systemTokenPair, Currencies.USD.symbol),
			getHistoricPrices(network, systemRamPair, network.token.symbol)
		]);

		const ram = TokenHistoricPrices.from({
			day: convertRamToUSD(ramsystemtoken.day, systemtoken.day),
			week: convertRamToUSD(ramsystemtoken.week, systemtoken.week),
			month: convertRamToUSD(ramsystemtoken.month, systemtoken.month),
			quarter: convertRamToUSD(ramsystemtoken.quarter, systemtoken.quarter),
			year: convertRamToUSD(ramsystemtoken.year, systemtoken.year)
		});

		return json(
			{
				ram,
				ramsystemtoken,
				systemtoken
			},
			{
				headers: getCacheHeaders(60)
			}
		);
	} catch (error) {
		console.warn(error);
		return json({ systemtoken: {}, ram: {} });
	}
};

const TIMEFRAMES = { day: '1d', week: '1w', month: '1mo', quarter: '3mo', year: '1y' } as const;

async function getHistoricPrices(
	network: NetworkState,
	identifier: string,
	symbol: Asset.Symbol
): Promise<TokenHistoricPrices> {
	const entries = await Promise.all(
		Object.entries(TIMEFRAMES).map(
			async ([key, timeframe]): Promise<[string, TokenHistoricPrice | undefined]> => [
				key,
				await getHistoricPrice(network, identifier, timeframe, symbol).catch((error) => {
					console.warn(error);
					return undefined;
				})
			]
		)
	);
	return TokenHistoricPrices.from(Object.fromEntries(entries));
}

function convertRamToUSD(
	ram: TokenHistoricPrice | undefined,
	systemToken: TokenHistoricPrice | undefined
): TokenHistoricPrice | undefined {
	if (!ram || !systemToken) {
		return undefined;
	}
	return TokenHistoricPrice.from({
		value: calculateValue(ram.value, systemToken.value),
		date: ram.date
	});
}

async function getHistoricPrice(
	network: NetworkState,
	identifier: string,
	timeframe: string,
	symbol: Asset.Symbol
): Promise<TokenHistoricPrice> {
	const url = `${network.config.endpoints.metrics}/historicprice/${identifier}/${timeframe}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} from ${url}`);
	}
	const json = await response.json();
	if (json.length === 0) {
		throw new Error(`No data found for ${identifier} in ${timeframe}`);
	}
	return TokenHistoricPrice.from({
		date: new Date(json[0]._time),
		value: Asset.fromUnits(json[0]._value, symbol)
	});
}
