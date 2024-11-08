import { APIClient, FetchProvider } from '@wharfkit/antelope';
import { ChainDefinition, Chains } from '@wharfkit/common';

import {
	API_EOS_CHAIN,
	API_EOS_HISTORY,
	API_JUNGLE4_CHAIN,
	API_JUNGLE4_HISTORY,
	API_KYLIN_CHAIN,
	API_KYLIN_HISTORY
} from '$env/static/private';

import { chainIndiceMapping, chainMapper, type ChainShortName } from '../chains';
import { getNetwork } from '$lib/state/network.svelte';

interface GetBackendClientOptions {
	history: boolean;
	headers: Record<string, string>;
}

export function getBackendClient(
	fetch: typeof window.fetch,
	chain: ChainShortName = 'eos',
	options: Partial<GetBackendClientOptions> = {}
): APIClient {
	if (!chainIndiceMapping[chain]) {
		throw new Error(`Chain ${chain} not supported`);
	}
	const chainDef = Chains[chainIndiceMapping[chain]];
	switch (chain) {
		case 'eos': {
			chainDef.url = options.history ? API_EOS_HISTORY : API_EOS_CHAIN;
			break;
		}
		case 'jungle4': {
			chainDef.url = options.history ? API_JUNGLE4_HISTORY : API_JUNGLE4_CHAIN;
			break;
		}
		case 'kylin': {
			chainDef.url = options.history ? API_KYLIN_HISTORY : API_KYLIN_CHAIN;
			break;
		}
		default: {
			throw new Error(`Chain ${chain} not supported`);
		}
	}
	return new APIClient({
		provider: new FetchProvider(chainDef.url, { fetch, headers: options.headers })
	});
}

export function getBackendNetwork(
	chain: ChainDefinition,
	fetch: typeof window.fetch,
	history: boolean = false
) {
	const client = getBackendClient(fetch, chainMapper.toShortName(String(chain.id)), {
		history
	});
	return getNetwork(chain, { client });
}
