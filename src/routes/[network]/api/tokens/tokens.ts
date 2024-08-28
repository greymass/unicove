import type { ChainShortName } from '$lib/wharf/chains';
import {
	ChainDefinition,
	Chains,
	TokenMeta,
	type TokenIdentifierType,
	type TokenMetaType
} from '@wharfkit/common';

function getSystemTokenIdentifier(chain: ChainDefinition): TokenIdentifierType {
	if (!chain.systemToken) {
		throw new Error('Chain does not have a system token');
	}
	return {
		chain: chain.id,
		contract: chain.systemToken.contract,
		symbol: chain.systemToken.symbol
	};
}

const data: TokenMetaType[] = [
	{
		id: getSystemTokenIdentifier(Chains.EOS),
		logo: 'https://assets.wharfkit.com/chain/eos.png'
	},
	{
		id: {
			chain: Chains.EOS.id,
			contract: 'scrap',
			symbol: '0,SCRAP'
		},
		logo: 'https://scrapload.io/favicon.ico'
	},
	{
		id: getSystemTokenIdentifier(Chains.Jungle4),
		logo: 'https://assets.wharfkit.com/chain/eos.png'
	},
	{
		id: getSystemTokenIdentifier(Chains.KylinTestnet),
		logo: 'https://assets.wharfkit.com/chain/eos.png'
	}
];

export const tokens: Record<ChainShortName, TokenMeta[]> = {
	eos: data
		.filter((meta) => Chains.EOS.id.equals(meta.id.chain))
		.map((meta) => TokenMeta.from(meta)),
	jungle4: data
		.filter((meta) => Chains.Jungle4.id.equals(meta.id.chain))
		.map((meta) => TokenMeta.from(meta)),
	kylin: data
		.filter((meta) => Chains.KylinTestnet.id.equals(meta.id.chain))
		.map((meta) => TokenMeta.from(meta))
};
