import { APIClient, FetchProvider } from '@wharfkit/antelope';
import { Chains } from '@wharfkit/common';

import {
	API_EOS_CHAIN,
	API_EOS_HISTORY,
	API_JUNGLE4_CHAIN,
	API_JUNGLE4_HISTORY,
	API_KYLIN_CHAIN,
	API_KYLIN_HISTORY
} from '$env/static/private';

import { chainIndiceMapping, type ChainShortName } from '../chains';

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
