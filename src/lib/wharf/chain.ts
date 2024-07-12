import { Chains } from '@wharfkit/common';
import { PUBLIC_CHAIN_NAME } from '$env/static/public';

if (!Chains[PUBLIC_CHAIN_NAME]) {
	throw new Error(`Unknown chain: ${PUBLIC_CHAIN_NAME}`);
}

export const chain = Chains[PUBLIC_CHAIN_NAME];
