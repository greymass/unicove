import { APIClient, FetchProvider } from '@wharfkit/antelope';

import { PRIVATE_BACKENDS } from '$env/static/private';

import { getChainConfigByName, type ChainBackend, type ChainConfig } from '$lib/wharf/chains';
import { getNetwork } from '$lib/state/network.svelte';

interface GetBackendClientOptions {
	history: boolean;
	headers: Record<string, string>;
}

const backends = JSON.parse(PRIVATE_BACKENDS) as ChainBackend[];

function getMergedConfig(chain: string): ChainConfig {
	const result = getChainConfigByName(chain);
	const backend = backends.find((b) => b.name === result.name);
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
	network: string,
	fetch: typeof window.fetch,
	options: Partial<GetBackendClientOptions> = {}
): APIClient {
	const config = getMergedConfig(network);
	const url = options.history ? config.endpoints.history : config.endpoints.api;
	return new APIClient({
		provider: new FetchProvider(url, { fetch, headers: options.headers })
	});
}

export function getBackendNetwork(
	config: ChainConfig,
	fetch: typeof window.fetch,
	options: Partial<GetBackendClientOptions> = {}
) {
	const client = getBackendClient(config.name, fetch, options);
	return getNetwork(config, { client });
}

export function getBackendNetworkByName(
	network: string,
	fetch: typeof window.fetch,
	options: Partial<GetBackendClientOptions> = {}
) {
	const config = getMergedConfig(network);
	return getBackendNetwork(config, fetch, options);
}
