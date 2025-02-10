import { json, type RequestEvent } from '@sveltejs/kit';
import { Asset, type API, type AssetType } from '@wharfkit/antelope';
import type { RAMState, REXState, PowerUpState, SampleUsage } from '@wharfkit/resources';

import { getCacheHeaders } from '$lib/utils';
import { Types as DelphioracleTypes } from '$lib/wharf/contracts/delphioracle.js';
import { Types as SystemTypes } from '$lib/wharf/contracts/system';
import { Types as UnicoveTypes } from '$lib/wharf/contracts/unicove';
import { getBackendNetwork } from '$lib/wharf/client/ssr';
import type { NetworkState } from '$lib/state/network.svelte';
import type { NetworkResponse } from '$lib/types';
import { getChainDefinitionFromParams } from '$lib/wharf/chains';

type ResponseType =
	| Asset[]
	| API.v1.GetCurrencyStatsResponse
	| RAMState
	| REXState
	| PowerUpState
	| SampleUsage
	| DelphioracleTypes.datapoints
	| SystemTypes.eosio_global_state
	| UnicoveTypes.get_network_response
	| undefined;

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch);

	let response;
	if (network.supports('unicovecontracts')) {
		response = await getNetwork2(network);
	} else {
		response = await getNetwork(network);
	}

	const headers = getCacheHeaders(5);

	return json(
		{
			ts: new Date(),
			...response
		},
		{
			headers
		}
	);
}

function addRequest(list: Promise<ResponseType>[], request: Promise<ResponseType>) {
	return list.push(request) - 1;
}

function getResponse(list: ResponseType[], index: number) {
	return index >= 0 && list.length > index ? list[index] : undefined;
}

async function getNetwork(network: NetworkState): Promise<NetworkResponse> {
	const requests: Promise<ResponseType>[] = [];
	let globalStateIndex = -1;
	let lockedsupplyIndex = -1;
	let ramStateIndex = -1;
	let rexStateIndex = -1;
	let powerupStateIndex = -1;
	let sampleUsageIndex = -1;
	let supplyIndex = -1;
	let tokenStateIndex = -1;

	globalStateIndex = addRequest(requests, network.contracts.system.table('global').get());

	if (network.supports('rammarket') && network.resourceClient) {
		ramStateIndex = addRequest(requests, network.resourceClient?.v1.ram.get_state());
	}
	if (network.supports('rex') && network.resourceClient) {
		rexStateIndex = addRequest(requests, network.resourceClient.v1.rex.get_state());
	}
	if (network.supports('powerup') && network.resourceClient) {
		powerupStateIndex = addRequest(requests, network.resourceClient.v1.powerup.get_state());
	}
	if (
		(network.supports('staking') || network.supports('rentrex') || network.supports('powerup')) &&
		network.resourceClient
	) {
		sampleUsageIndex = addRequest(requests, network.resourceClient.getSampledUsage());
	}
	if (network.chain.systemToken) {
		supplyIndex = addRequest(
			requests,
			network.client.v1.chain.get_currency_stats(
				network.chain.systemToken.contract,
				network.chain.systemToken.symbol.name
			)
		);
	}
	if (network.chain.systemToken && network.config.lockedsupply) {
		lockedsupplyIndex = addRequest(
			requests,
			network.client.v1.chain.get_currency_balance(
				network.chain.systemToken.contract,
				network.config.lockedsupply[0],
				network.chain.systemToken.symbol.name
			)
		);
	}
	if (network.supports('delphioracle')) {
		const pairname = `${network.chain.systemToken!.symbol.name.toLowerCase()}usd`;
		tokenStateIndex = addRequest(
			requests,
			network.contracts.delphioracle.table('datapoints', pairname).get()
		);
	}

	const results = await Promise.all(requests);
	const ramstate = getResponse(results, ramStateIndex);
	const rexstate = getResponse(results, rexStateIndex);
	const globalstate = getResponse(results, globalStateIndex);
	const powerupstate = getResponse(results, powerupStateIndex);
	const sampleUsage = getResponse(results, sampleUsageIndex);
	const supplyResult = getResponse(results, supplyIndex) as API.v1.GetCurrencyStatsResponse;
	const lockedsupplyResponse = getResponse(results, lockedsupplyIndex);
	const lockedsupply: Asset = lockedsupplyResponse
		? Asset.from((lockedsupplyResponse as AssetType[])[0])
		: Asset.fromUnits(0, network.chain.systemToken!.symbol);
	const tokenstate = getResponse(results, tokenStateIndex);

	const index = String(network.chain.systemToken?.symbol.name);
	const supply = supplyResult[index];
	const circulating = Asset.fromUnits(
		supply.supply.units.subtracting(lockedsupply.units),
		supply.supply.symbol
	);

	return {
		global: globalstate as SystemTypes.eosio_global_state,
		token: UnicoveTypes.token_supply.from({
			def: {
				contract: network.chain.systemToken!.contract,
				symbol: network.chain.systemToken!.symbol
			},
			circulating,
			locked: lockedsupply,
			supply: supply.supply,
			max: supply.max_supply
		}),
		ram: ramstate as SystemTypes.exchange_state,
		rex: rexstate as SystemTypes.rex_pool,
		oracle: tokenstate as DelphioracleTypes.datapoints,
		powerup: powerupstate as SystemTypes.powerup_state,
		sample: sampleUsage as SampleUsage
	};
}

async function getNetwork2(network: NetworkState): Promise<NetworkResponse> {
	let oracle: DelphioracleTypes.datapoints | undefined;
	let sample: SampleUsage | undefined;

	if (!network.supports('unicovecontracts')) {
		throw new Error('Unicove contract not available');
	}

	const networkState = await network.contracts.unicove.readonly('network');

	if (
		(network.supports('staking') || network.supports('rentrex') || network.supports('powerup')) &&
		network.resourceClient
	) {
		sample = await network.resourceClient.getSampledUsage();
	}

	if (network.supports('delphioracle')) {
		oracle = await network.contracts.delphioracle.table('datapoints', 'eosusd').get();
	}

	return {
		...networkState,
		oracle,
		sample
	};
}
