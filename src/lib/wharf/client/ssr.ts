import { APIClient, FetchProvider } from '@wharfkit/antelope';

import * as env from '$env/static/private';

import { getChainConfigByName, type ChainConfig, type ChainEndpoints } from '$lib/wharf/chains';
import { getNetwork } from '$lib/state/network.svelte';

interface GetBackendClientOptions {
	history: boolean;
	hyperion: boolean;
	headers: Record<string, string>;
}

const backendEndpoints: ChainEndpoints = {
	api: env.BACKEND_API_CHAIN,
	history: env.BACKEND_API_HISTORY,
	hyperion: env.BACKEND_API_HYPERION,
	lightapi: env.BACKEND_API_LIGHTAPI,
	metrics: env.BACKEND_API_METRICS
};

function getMergedConfig(chain: string): ChainConfig {
	const result = getChainConfigByName(chain);
	return {
		...result,
		endpoints: {
			...result.endpoints,
			...backendEndpoints
		}
	};
}

export function getBackendClient(
	network: string,
	fetch: typeof window.fetch,
	options: Partial<GetBackendClientOptions> = {}
): APIClient {
	const config = getMergedConfig(network);
	let url = config.endpoints.api;
	if (options.hyperion && config.endpoints.hyperion) {
		url = config.endpoints.hyperion;
	} else if (options.history) {
		url = config.endpoints.history;
	}
	return new APIClient({
		provider: new FetchProvider(url, { fetch, headers: options.headers })
	});
}

export function getBackendNetwork(
	config: ChainConfig,
	fetch: typeof window.fetch,
	options: Partial<GetBackendClientOptions> = {}
) {
	const client = getBackendClient(config.short, fetch, options);
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
