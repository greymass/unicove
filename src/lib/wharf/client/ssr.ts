import { APIClient, FetchProvider } from '@wharfkit/antelope';
import { ChainDefinition } from '@wharfkit/common';

import { PRIVATE_BACKENDS } from '$env/static/private';

import { chainMapper, getChainConfigByName, type ChainBackend, type ChainConfig } from '../chains';
import { getNetwork } from '$lib/state/network.svelte';

interface GetBackendClientOptions {
	history: boolean;
	headers: Record<string, string>;
}

const backends = JSON.parse(PRIVATE_BACKENDS) as ChainBackend[];

export function getChainConfigByNamePrivate(chain: string): ChainConfig {
	const result = getChainConfigByName(chain);
	const backend = backends.find((b) => b.id === result.id);
	if (backend) {
		return {
			...result,
			endpoints: {
				...result.endpoints,
				...backend.endpoints
			}
		};
	}
	return result;
}

export function getBackendClient(
	fetch: typeof window.fetch,
	chain: string = 'eos',
	options: Partial<GetBackendClientOptions> = {}
): APIClient {
	const config = getChainConfigByNamePrivate(chain);
	const url = options.history ? config.endpoints.history : config.endpoints.api;
	return new APIClient({
		provider: new FetchProvider(url, { fetch, headers: options.headers })
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

export function getLightAPIURL(chain: string) {
	return getChainConfigByNamePrivate(chain).endpoints.lightapi;
}
