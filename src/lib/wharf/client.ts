import { APIClient, FetchProvider } from '@wharfkit/antelope';
import { Chains, type ChainIndices } from '@wharfkit/common';

export type supportedChainNames = 'eos' | 'jungle4';

export const supportedChains: Record<string, ChainIndices> = {
	eos: 'EOS',
	jungle4: 'Jungle4'
};

export function getClient(fetch: typeof window.fetch, chain: string = 'eos') {
	if (!supportedChains[chain]) {
		throw new Error(`Chain ${chain} not supported`);
	}
	const chainDef = Chains[supportedChains[chain]];
	return new APIClient({ provider: new FetchProvider(chainDef.url, { fetch }) });
}
