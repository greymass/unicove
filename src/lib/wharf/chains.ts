import type { Asset, Checksum256Type, NameType } from '@wharfkit/antelope';
import { ChainDefinition, TokenIdentifier } from '@wharfkit/common';

import { Contract as DelphiHelperContract } from '$lib/wharf/contracts/delphihelper';
import { Contract as DelphiOracleContract } from '$lib/wharf/contracts/delphioracle';
import { Contract as MSIGContract } from '$lib/wharf/contracts/msig';
import { Contract as SystemContract } from '$lib/wharf/contracts/system';
import { Contract as TimeContract } from '$lib/wharf/contracts/eosntime';
import { Contract as TokenContract } from '$lib/wharf/contracts/token';
import { Contract as UnicoveContract } from '$lib/wharf/contracts/unicove';

import { PUBLIC_CHAINS } from '$env/static/public';

export const chains = JSON.parse(PUBLIC_CHAINS) as ChainConfig[];

export interface DefaultContracts {
	delphihelper: DelphiHelperContract;
	delphioracle: DelphiOracleContract;
	eosntime: TimeContract;
	msig: MSIGContract;
	system: SystemContract;
	token: TokenContract;
	unicove: UnicoveContract;
}

export interface ChainEndpoints {
	api: string;
	history: string;
	lightapi?: string;
	metrics?: string;
}

export interface ChainBackend {
	name: string;
	endpoints: ChainEndpoints;
}

export interface ChainCoinbaseConfig {
	appid: string;
	assets: string[];
}

export interface ChainMetaMaskConfig {
	name: string;
	snaporigin: string;
	serviceurl: string;
}

export interface ChainToken {
	contract: NameType;
	symbol: Asset.SymbolType;
}

export interface ChainConfig {
	id: Checksum256Type;
	name: string;
	features: Record<FeatureType, boolean>;
	endpoints: ChainEndpoints;
	lockedsupply?: NameType[]; // Accounts where tokens exist but are not in circulation
	coinbase?: ChainCoinbaseConfig;
	metamask?: ChainMetaMaskConfig;
	systemtoken: ChainToken;
	tokens: ChainToken[];
}

export type FeatureType =
	| 'delphihelper'
	| 'delphioracle'
	| 'directfunding'
	| 'eosntime'
	| 'giftedram'
	| 'lightapi'
	| 'metamask'
	| 'powerup'
	| 'rammarket'
	| 'rentrex'
	| 'rex'
	| 'robo'
	| 'stakeresource'
	| 'staking'
	| 'timeseries'
	| 'unicovecontracts';

export function getChainConfigByName(name: string): ChainConfig {
	const chain = chains.find((c) => c.name === name);
	if (!chain) {
		throw new Error(`Chain ${name} not configured for use in getChainConfigByName.`);
	}
	return chain;
}

export function getChainConfigById(id: Checksum256Type): ChainConfig {
	const name = chainMap[String(id)];
	if (!name) {
		throw new Error(`Chain ${id} not found in chain map.`);
	}
	const chain = chains.find((c) => c.name === name);
	if (!chain) {
		throw new Error(`Chain ${name} not configured for use in getChainConfigById.`);
	}
	return chain;
}

export function getChainDefinitionFromParams(network: string): ChainDefinition {
	const config = getChainConfigByName(network);
	if (!config) {
		throw new Error(`Chain config not found: ${network}`);
	}
	return ChainDefinition.from({
		id: config.id,
		url: config.endpoints.api,
		systemToken: TokenIdentifier.from({
			chain: config.id,
			contract: config.systemtoken.contract,
			symbol: config.systemtoken.symbol
		})
	});
}

export const chainShortNames = chains.map((chain) => chain.name) as string[];
export function isNetworkShortName(value: string) {
	return chainShortNames.includes(value);
}

export const chainMap: Record<string, string> = {};
chains.forEach((chain) => {
	chainMap[String(chain.id)] = chain.name;
});

type Invert<M extends Record<keyof M, PropertyKey>> = {
	[K in keyof M as M[K]]: K;
};

export function createMappers<M extends Record<keyof M, PropertyKey>>(map: M) {
	const invertedMap = (Object.entries(map) as Array<[PropertyKey, PropertyKey]>).reduce(
		(inverted, [key, value]) => ({ ...inverted, [value]: key }),
		{}
	) as Invert<M>;
	const toShortName = <K extends keyof M>(from: K) => map[from];
	const toChainId = <K extends keyof Invert<M>>(to: K) => invertedMap[to];

	return { toShortName, toChainId };
}

export const chainMapper = createMappers(chainMap);
