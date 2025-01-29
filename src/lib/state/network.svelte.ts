import { APIClient, Asset, FetchProvider, Int128, type AssetType } from '@wharfkit/antelope';
import { Chains, ChainDefinition, TokenMeta } from '@wharfkit/common';
import { RAMState, Resources, REXState, PowerUpState } from '@wharfkit/resources';
import { ABICache, chainIdsToIndices } from '@wharfkit/session';
import { snapOrigins } from '@wharfkit/wallet-plugin-metamask';

import { Types as DelphiOracleTypes } from '$lib/wharf/contracts/delphioracle';
import { Contract as DelphiOracleContract } from '$lib/wharf/contracts/delphioracle';
import { Contract as MSIGContract } from '$lib/wharf/contracts/msig';
import { Contract as SystemContract, Types as SystemTypes } from '$lib/wharf/contracts/system';
import { Contract as TokenContract } from '$lib/wharf/contracts/token';
import { Contract as UnicoveContract } from '$lib/wharf/contracts/unicove';

import {
	chainConfigs,
	chainMapper,
	type ChainConfig,
	type ChainShortName,
	type DefaultContracts,
	type FeatureType
} from '$lib/wharf/chains';

import { tokens } from '../../routes/[network]/api/tokens/tokens';
import { calculateValue } from '$lib/utils';
import { SampledUsage } from '$lib/types';

export interface NetworkStateOptions {
	fetch?: typeof fetch;
	client?: APIClient;
}

export class NetworkState {
	public client: APIClient;
	public chain: ChainDefinition;
	public config: ChainConfig;
	public fetch = fetch;
	public last_update: Date = $state(new Date());
	public loaded = $state(false);
	public shortname: keyof typeof tokens;
	public snapOrigin?: string = $state();

	public contracts: DefaultContracts;

	public abis?: ABICache = $state();
	public globalstate?: SystemTypes.eosio_global_state = $state();
	public marketcap: Asset = $derived.by(() => {
		if (this.supply && this.tokenprice) {
			return calculateValue(this.supply, this.tokenprice);
		}
		return Asset.fromUnits(0, '4,USD');
	});
	public ramstate?: RAMState = $state();
	public resources?: Resources = $state();
	public rexstate?: REXState = $state();
	public powerupstate?: PowerUpState = $state();
	public sampledUsage?: SampledUsage = $state();
	public supply?: Asset = $state();
	public tokenmeta?: TokenMeta[] = $state();
	public tokenstate?: DelphiOracleTypes.datapoints = $state();
	public tokenprice = $derived.by(() => {
		return this.tokenstate ? Asset.fromUnits(this.tokenstate.median, '4,USD') : undefined;
	});
	public ramprice = $derived(
		this.ramstate ? getRAMPrice(this.ramstate, this.tokenprice) : undefined
	);

	constructor(chain: ChainDefinition, options: NetworkStateOptions = {}) {
		this.chain = chain;
		this.config = chainConfigs[String(this.chain.id)];
		this.shortname = chainMapper.toShortName(String(this.chain.id));
		this.snapOrigin = snapOrigins.get(this.shortname);
		this.tokenmeta = tokens[this.shortname];

		if (options.fetch) {
			this.fetch = options.fetch;
		}

		if (options.client) {
			this.client = options.client;
		} else {
			this.client = new APIClient(
				new FetchProvider(this.chain.url, {
					fetch: this.fetch
				})
			);
		}

		this.abis = new ABICache(this.client);

		this.resources = new Resources({
			api: this.client,
			sampleAccount: 'eosio.reserv'
		});

		this.contracts = {
			delphioracle: new DelphiOracleContract({ client: this.client }),
			msig: new MSIGContract({ client: this.client }),
			system: new SystemContract({ client: this.client }),
			token: new TokenContract({ client: this.client }),
			unicove: new UnicoveContract({ client: this.client })
		};
	}

	async refresh() {
		const response = await this.fetch(
			`/${chainMapper.toShortName(String(this.chain.id))}/api/network`
		);
		const json = await response.json();
		this.last_update = new Date();
		this.tokenstate = json.tokenstate;

		try {
			this.globalstate = SystemTypes.eosio_global_state.from(json.globalstate);
		} catch (error) {
			console.log('GlobalState Parse', error);
			console.log(json);
		}

		try {
			this.ramstate = RAMState.from(json.ramstate);
		} catch (error) {
			console.log('RAMState parse', error);
			console.log(json);
		}

		try {
			this.rexstate = REXState.from(json.rexstate);
		} catch (error) {
			console.log('REXState parse', error);
			console.log(json);
		}

		try {
			this.powerupstate = PowerUpState.from(json.powerupstate);
		} catch (error) {
			console.log('PowerUpState parse', error);
			console.log(json);
		}

		try {
			this.sampledUsage = SampledUsage.from(json.sampleUsage);
		} catch (error) {
			console.log('SampledUsage Parse', error);
			console.log(json);
		}

		try {
			const index = String(this.chain.systemToken?.symbol.name);
			const supply = Asset.from(json.supply[index].supply);
			if (json.lockedsupply && json.lockedsupply.length) {
				for (const balance of json.lockedsupply) {
					const locked = Asset.from(balance);
					supply.units.subtract(locked.units);
				}
			}
			this.supply = supply;
		} catch (error) {
			console.log('Supply Parse', error);
			console.log(json);
		}

		this.loaded = true;
	}

	supports = (feature: FeatureType): boolean => this.config.features[feature];

	tokenToRex = (token: AssetType) => {
		if (!this.rexstate) {
			throw new Error('REX state not initialized');
		}
		const asset = Asset.from(token);
		const { total_lendable, total_rex } = this.rexstate;
		const S1 = total_lendable.units.adding(asset.units);
		const R1 = Int128.from(S1).multiplying(total_rex.units).dividing(total_lendable.units);
		const result = R1.subtracting(total_rex.units);
		return Asset.fromUnits(result, total_rex.symbol);
	};

	rexToToken = (rex: AssetType) => {
		if (!this.rexstate) {
			throw new Error('REX state not initialized');
		}
		const asset = Asset.from(rex);
		const { total_lendable, total_rex } = this.rexstate;
		const R1 = total_rex.units.adding(asset.units);
		const S1 = Int128.from(R1).multiplying(total_lendable.units).dividing(total_rex.units);
		const result = S1.subtracting(total_lendable.units);
		return Asset.fromUnits(result, total_lendable.symbol);
	};

	toString() {
		return chainMapper.toShortName(String(this.chain.id));
	}

	toJSON() {
		return {
			chain: this.chain,
			last_update: this.last_update,
			marketcap: this.marketcap,
			ramstate: this.ramstate,
			ramprice: this.ramprice,
			rexstate: this.rexstate,
			sampleAccount: this.resources?.sampleAccount,
			supply: this.supply,
			tokenprice: this.tokenprice,
			tokenstate: this.tokenstate
		};
	}
}

export function getRAMPrice(state: RAMState, systemTokenPrice?: Asset) {
	const cost = state.price_per_kb(1);
	return {
		eos: cost,
		usd: systemTokenPrice ? calculateValue(cost, systemTokenPrice) : undefined
	};
}

export function getNetwork(
	chain: ChainDefinition,
	options: NetworkStateOptions = {}
): NetworkState {
	const network = new NetworkState(chain, options);
	return network;
}

export function getChainDefinitionFromParams(network: string): ChainDefinition {
	if (network) {
		const id = chainMapper.toChainId(network as ChainShortName);
		const name = chainIdsToIndices.get(id);
		if (name) {
			// Return the chain that's found
			return Chains[name];
		}
	}
	// Return EOS as the default network if params.network is not defined
	return Chains.EOS;
}

export function getNetworkFromParams(network: string, fetch?: typeof window.fetch): NetworkState {
	const chain = getChainDefinitionFromParams(network);
	const state = getNetwork(chain, { fetch });
	return state;
}
