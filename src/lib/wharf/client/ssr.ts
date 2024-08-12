import { APIClient, FetchProvider } from '@wharfkit/antelope';
import { Chains } from '@wharfkit/common';

import {
	API_EOS_CHAIN,
	API_EOS_HISTORY,
	API_JUNGLE4_CHAIN,
	API_JUNGLE4_HISTORY
} from '$env/static/private';
import { supportedChains, type supportedChainNames } from '../client';

export function getBackendClient(
	fetch: typeof window.fetch,
	chain: supportedChainNames = 'eos',
	history = false
): APIClient {
	if (!supportedChains[chain]) {
		throw new Error(`Chain ${chain} not supported`);
	}
	const chainDef = Chains[supportedChains[chain]];
	switch (chain) {
		case 'eos': {
			chainDef.url = history ? API_EOS_HISTORY : API_EOS_CHAIN;
			break;
		}
		case 'jungle4': {
			chainDef.url = history ? API_JUNGLE4_HISTORY : API_JUNGLE4_CHAIN;
			break;
		}
		default: {
			throw new Error(`Chain ${chain} not supported`);
		}
	}
	return new APIClient({ provider: new FetchProvider(chainDef.url, { fetch }) });
}
