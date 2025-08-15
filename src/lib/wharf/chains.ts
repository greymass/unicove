import { Asset, Name, type Checksum256Type, type NameType } from '@wharfkit/antelope';
import { ChainDefinition, Logo, TokenIdentifier } from '@wharfkit/common';

import { Contract as DelphiHelperContract } from '$lib/wharf/contracts/delphihelper';
import { Contract as DelphiOracleContract } from '$lib/wharf/contracts/delphioracle';
import { Contract as MSIGContract } from '$lib/wharf/contracts/msig';
import { Contract as RegistryContract } from '$lib/wharf/contracts/registry';
import { Contract as ReserveContract } from '$lib/wharf/contracts/eosio.reserv';
import { Contract as REXContract } from '$lib/wharf/contracts/eosio.rex';
import { Contract as SystemContract } from '$lib/wharf/contracts/system';
import { Contract as TimeContract } from '$lib/wharf/contracts/eosntime';
import { Contract as TokenContract } from '$lib/wharf/contracts/token';
import { Contract as UnicoveContract } from '$lib/wharf/contracts/unicove.api';
import { Contract as VaultaContract } from '$lib/wharf/contracts/core.vaulta';
import { Contract as WRAMContract } from '$lib/wharf/contracts/eosio.wram';

import * as env from '$env/static/public';

import { Token, TokenMedia, TokenMediaAsset } from '$lib/types/token';
import { isENVTrue } from '$lib/utils/strings';

const coinbase =
	env.PUBLIC_FEATURE_DIRECTFUNDING === 'true'
		? {
				assets: env.PUBLIC_FEATURE_COINBASE_ASSETS.split(',')
			}
		: undefined;

const metamask =
	env.PUBLIC_FEATURE_METAMASK === 'true'
		? {
				name: env.PUBLIC_FEATURE_METAMASK_PRODUCT_NAME,
				snaporigin: env.PUBLIC_FEATURE_METAMASK_SNAP_ORIGIN,
				serviceurl: env.PUBLIC_FEATURE_METAMASK_SERVICE_URL
			}
		: undefined;

const legacytokenasset = TokenMediaAsset.from({});
if (env.PUBLIC_LEGACY_TOKEN_LOGO_LIGHT) {
	legacytokenasset.light = env.PUBLIC_LEGACY_TOKEN_LOGO_LIGHT;
}
if (env.PUBLIC_LEGACY_TOKEN_LOGO_DARK) {
	legacytokenasset.dark = env.PUBLIC_LEGACY_TOKEN_LOGO_DARK;
}

export const legacytoken =
	env.PUBLIC_LEGACY_TOKEN_CONTRACT && env.PUBLIC_LEGACY_TOKEN_SYMBOL
		? Token.from({
				id: {
					chain: env.PUBLIC_CHAIN_ID,
					contract: env.PUBLIC_LEGACY_TOKEN_CONTRACT,
					symbol: env.PUBLIC_LEGACY_TOKEN_SYMBOL
				},
				media: TokenMedia.from({
					logo: legacytokenasset
				})
			})
		: undefined;

const lockedsupply = env.PUBLIC_FEATURE_METAMASK
	? env.PUBLIC_SYSTEM_TOKEN_LOCKED_SUPPLY.split(',').map((account) => Name.from(account))
	: undefined;

const systemtokenalt = env.PUBLIC_SYSTEM_TOKEN_SYMBOL_ALT
	? env.PUBLIC_SYSTEM_TOKEN_SYMBOL_ALT.split('|').map((symbol) => Asset.Symbol.from(symbol))
	: [];

const systemtokenasset = TokenMediaAsset.from({});
if (env.PUBLIC_SYSTEM_TOKEN_LOGO_LIGHT) {
	systemtokenasset.light = env.PUBLIC_SYSTEM_TOKEN_LOGO_LIGHT;
}
if (env.PUBLIC_SYSTEM_TOKEN_LOGO_DARK) {
	systemtokenasset.dark = env.PUBLIC_SYSTEM_TOKEN_LOGO_DARK;
}
export const systemcontract = Name.from(env.PUBLIC_SYSTEM_CONTRACT);
export const systemtoken = Token.from({
	id: {
		chain: env.PUBLIC_CHAIN_ID,
		contract: env.PUBLIC_SYSTEM_TOKEN_CONTRACT,
		symbol: env.PUBLIC_SYSTEM_TOKEN_SYMBOL
	},
	media: TokenMedia.from({
		logo: systemtokenasset
	})
});

const ramtokenasset = TokenMediaAsset.from({});
if (env.PUBLIC_RAM_TOKEN_LOGO_LIGHT) {
	ramtokenasset.light = env.PUBLIC_RAM_TOKEN_LOGO_LIGHT;
}
if (env.PUBLIC_RAM_TOKEN_LOGO_DARK) {
	ramtokenasset.dark = env.PUBLIC_RAM_TOKEN_LOGO_DARK;
}
export const ramtoken = Token.from({
	id: {
		chain: env.PUBLIC_CHAIN_ID,
		contract: env.PUBLIC_SYSTEM_CONTRACT,
		symbol: '3,KB'
	},
	media: TokenMedia.from({
		logo: ramtokenasset
	})
});
export const wramtoken = Token.from({
	id: {
		chain: env.PUBLIC_CHAIN_ID,
		contract: 'eosio.wram',
		symbol: '0,WRAM'
	},
	media: TokenMedia.from({
		logo: ramtokenasset
	})
});

export const chainConfig: ChainConfig = {
	id: env.PUBLIC_CHAIN_ID,
	short: env.PUBLIC_CHAIN_SHORT,
	name: env.PUBLIC_CHAIN_NAME,
	logo: Logo.from({
		dark: env.PUBLIC_CHAIN_LOGO_DARK,
		light: env.PUBLIC_CHAIN_LOGO_LIGHT
	}),
	systemcontract: Name.from(env.PUBLIC_SYSTEM_CONTRACT),
	systemtoken,
	systemtokenalt,
	legacytoken,
	lockedsupply,
	endpoints: {
		api: env.PUBLIC_API_CHAIN,
		history: env.PUBLIC_API_HISTORY
	},
	features: {
		delphihelper: isENVTrue(env.PUBLIC_FEATURE_DELPHIHELPER),
		delphioracle: isENVTrue(env.PUBLIC_FEATURE_DELPHIORACLE),
		directfunding: isENVTrue(env.PUBLIC_FEATURE_DIRECTFUNDING),
		eosntime: isENVTrue(env.PUBLIC_FEATURE_EOSNTIME),
		giftedram: isENVTrue(env.PUBLIC_FEATURE_GIFTEDRAM),
		hyperion: isENVTrue(env.PUBLIC_FEATURE_HYPERION),
		lightapi: isENVTrue(env.PUBLIC_FEATURE_LIGHTAPI),
		metamask: isENVTrue(env.PUBLIC_FEATURE_METAMASK),
		powerup: isENVTrue(env.PUBLIC_FEATURE_POWERUP),
		rammarket: isENVTrue(env.PUBLIC_FEATURE_RAMMARKET),
		ramtransfer: isENVTrue(env.PUBLIC_FEATURE_RAMTRANSFER),
		registry: !!env.PUBLIC_FEATURE_REGISTRY_CONTRACT,
		rentrex: isENVTrue(env.PUBLIC_FEATURE_RENTREX),
		rex: isENVTrue(env.PUBLIC_FEATURE_REX),
		robo: isENVTrue(env.PUBLIC_FEATURE_ROBO),
		stakeresource: isENVTrue(env.PUBLIC_FEATURE_STAKERESOURCE),
		staking: isENVTrue(env.PUBLIC_FEATURE_STAKING),
		timeseries: isENVTrue(env.PUBLIC_FEATURE_TIMESERIES),
		unicovecontractapi: !!env.PUBLIC_FEATURE_UNICOVE_CONTRACT_API,
		wram: isENVTrue(env.PUBLIC_FEATURE_WRAM)
	},
	metamask,
	coinbase
};

export const chains = [chainConfig];

export interface DefaultContracts {
	delphihelper: DelphiHelperContract;
	delphioracle: DelphiOracleContract;
	eosntime: TimeContract;
	msig: MSIGContract;
	registry: RegistryContract;
	reserve: ReserveContract;
	rex: REXContract;
	system: SystemContract;
	token: TokenContract;
	unicove: UnicoveContract;
	vaulta: VaultaContract;
	wram: WRAMContract;
}

export interface ChainEndpoints {
	api: string;
	history: string;
	hyperion?: string;
	lightapi?: string;
	metrics?: string;
}

export interface ChainBackend {
	name: string;
	endpoints: ChainEndpoints;
}

export interface ChainCoinbaseConfig {
	assets: string[];
}

export interface ChainMetaMaskConfig {
	name: string;
	snaporigin: string;
	serviceurl: string;
}

export interface ChainConfig {
	id: Checksum256Type;
	name: string;
	short: string;
	logo: Logo;
	features: Record<FeatureType, boolean>;
	endpoints: ChainEndpoints;
	legacytoken?: Token;
	lockedsupply?: NameType[]; // Accounts where tokens exist but are not in circulation
	coinbase?: ChainCoinbaseConfig;
	metamask?: ChainMetaMaskConfig;
	systemcontract: Name;
	systemtoken: Token;
	systemtokenalt: Asset.Symbol[];
}

export type FeatureType =
	| 'delphihelper'
	| 'delphioracle'
	| 'directfunding'
	| 'eosntime'
	| 'giftedram'
	| 'hyperion'
	| 'lightapi'
	| 'metamask'
	| 'powerup'
	| 'rammarket'
	| 'ramtransfer'
	| 'registry'
	| 'rentrex'
	| 'rex'
	| 'robo'
	| 'stakeresource'
	| 'staking'
	| 'timeseries'
	| 'unicovecontractapi'
	| 'wram';

export function getChainConfigByName(name: string): ChainConfig {
	const chain = chains.find((c) => c.short === name);
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

export const chainShortNames = chains.map((chain) => chain.short) as string[];
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
