import { json, type RequestEvent } from '@sveltejs/kit';

import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import type { RAMState, REXState, PowerUpState, SampleUsage } from '@wharfkit/resources';
import { Types as DelphioracleTypes } from '$lib/wharf/contracts/delphioracle.js';
import { Types as SystemTypes } from '$lib/wharf/contracts/system';
import { getBackendNetwork } from '$lib/wharf/client/ssr';
import type { API, Asset } from '@wharfkit/antelope';

type ResponseType =
	| Asset[]
	| API.v1.GetCurrencyStatsResponse
	| RAMState
	| REXState
	| PowerUpState
	| SampleUsage
	| DelphioracleTypes.datapoints
	| SystemTypes.eosio_global_state
	| undefined;

export async function GET({ fetch, params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}

	const network = getBackendNetwork(chain, fetch);
	if (!network.resources) {
		return json({ error: 'Network resources not initialized' }, { status: 500 });
	}

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

	if (network.supports('rammarket')) {
		ramStateIndex = addRequest(requests, network.resources.v1.ram.get_state());
	}
	if (network.supports('rex')) {
		rexStateIndex = addRequest(requests, network.resources.v1.rex.get_state());
	}
	if (network.supports('powerup')) {
		powerupStateIndex = addRequest(requests, network.resources.v1.powerup.get_state());
	}
	if (network.supports('staking') || network.supports('rentrex') || network.supports('powerup')) {
		sampleUsageIndex = addRequest(requests, network.resources.getSampledUsage());
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
	if (network.contracts.delphioracle) {
		tokenStateIndex = addRequest(
			requests,
			network.contracts.delphioracle.table('datapoints', 'eosusd').get()
		);
	}
	const results = await Promise.all(requests);
	const ramstate = getResponse(results, ramStateIndex);
	const rexstate = getResponse(results, rexStateIndex);
	const globalstate = getResponse(results, globalStateIndex);
	const powerupstate = getResponse(results, powerupStateIndex);
	const sampleUsage = getResponse(results, sampleUsageIndex);
	const supply = getResponse(results, supplyIndex);
	const lockedsupply = getResponse(results, lockedsupplyIndex);
	const tokenstate = getResponse(results, tokenStateIndex);

	const systemtoken = ramstate ? (ramstate as RAMState).quote.balance.symbol : undefined;

	const headers = getCacheHeaders(5);

	return json(
		{
			ts: new Date(),
			globalstate,
			lockedsupply,
			ramstate,
			rexstate,
			powerupstate,
			systemtoken,
			tokenstate,
			sampleUsage,
			supply
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
