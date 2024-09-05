import { APIClient, Asset, FetchProvider, Int128, type AssetType } from '@wharfkit/antelope';
import { Chains, ChainDefinition, TokenMeta } from '@wharfkit/common';
import { RAMState, Resources, REXState } from '@wharfkit/resources';
import { chainIdsToIndices } from '@wharfkit/session';
import { snapOrigins } from '@wharfkit/wallet-plugin-metamask';

import { Types as DelphiOracleTypes } from '$lib/wharf/contracts/delphioracle';
import { Contract as DelphiOracleContract } from '$lib/wharf/contracts/delphioracle';
import { Contract as SystemContract } from '$lib/wharf/contracts/system';
import { Contract as TokenContract } from '$lib/wharf/contracts/token';

import {
	chainConfigs,
	chainMapper,
	type ChainConfig,
	type DefaultContracts
} from '$lib/wharf/chains';

import { calculateValue } from './client/account.svelte';
import { tokens } from '../../routes/[network]/api/tokens/tokens';

export class NetworkState {
	public chain: ChainDefinition;
	public config: ChainConfig;
	public fetch = fetch;
	public last_update: Date = $state(new Date());
	public loaded = $state(false);
	public shortname: string;
	public snapOrigin?: string = $state();

	public contracts: DefaultContracts;

	public ramstate?: RAMState = $state();
	public resources?: Resources = $state();
	public rexstate?: REXState = $state();
	public tokenmeta?: TokenMeta[] = $state();
	public tokenstate?: DelphiOracleTypes.datapoints = $state();
	public rexprice = $derived.by(() => undefined);
	public tokenprice = $derived.by(() => {
		return this.tokenstate ? Asset.fromUnits(this.tokenstate.median, '4,USD') : undefined;
	});
	public ramprice = $derived(
		this.ramstate ? getRAMPrice(this.ramstate, this.tokenprice) : undefined
	);

	constructor(chain: ChainDefinition, fetchOverride?: typeof fetch) {
		this.chain = chain;
		this.config = chainConfigs[String(this.chain.id)];
		this.shortname = chainMapper.toShortName(String(this.chain.id));
		this.snapOrigin = snapOrigins.get(this.shortname);
		this.tokenmeta = tokens[this.shortname];
		if (fetchOverride) {
			this.fetch = fetchOverride;
		}
		this.resources = new Resources({
			api: this.client,
			sampleAccount: 'eosio.reserv'
		});

		this.contracts = {
			token: new TokenContract({ client: this.client }),
			system: new SystemContract({ client: this.client })
		};

		if (this.config.features.delphioracle) {
			this.contracts.delphioracle = new DelphiOracleContract({ client: this.client });
		}
	}

	public get client() {
		return new APIClient(
			new FetchProvider(this.chain.url, {
				fetch: this.fetch
			})
		);
	}

	async refresh() {
		const response = await this.fetch(
			`/${chainMapper.toShortName(String(this.chain.id))}/api/network`
		);
		const json = await response.json();

		this.last_update = new Date();
		this.tokenstate = json.tokenstate;

		try {
			this.ramstate = RAMState.from(json.ramstate);
			this.rexstate = REXState.from(json.rexstate);
		} catch (error) {
			console.log(error);
			console.log(json);
		}

		this.loaded = true;
	}

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
			ramstate: this.ramstate,
			ramprice: this.ramprice,
			rexstate: this.rexstate,
			sampleAccount: this.resources?.sampleAccount,
			tokenprice: this.tokenprice,
			tokenstate: this.tokenstate
		};
	}
}

interface NetworkServiceInstance {
	chain: string;
	network: NetworkState;
}

const services = $state<NetworkServiceInstance[]>([]);

export function getRAMPrice(state: RAMState, systemTokenPrice?: Asset) {
	const cost = state.price_per_kb(1);
	return {
		eos: cost,
		usd: systemTokenPrice ? calculateValue(cost, systemTokenPrice) : undefined
	};
}

export function getNetwork(chain: ChainDefinition, fetchOverride?: typeof window.fetch) {
	let current = services.find((service) => chain.id.equals(service.chain));
	if (!current) {
		const network = new NetworkState(chain, fetchOverride);
		current = { chain: String(chain.id), network };
		services.push(current);
	}
	return current.network;
}

export function getChainDefinitionFromParams(network: string): ChainDefinition {
	if (network) {
		const id = chainMapper.toChainId(network);
		const name = chainIdsToIndices.get(id);
		if (name) {
			// Return the chain that's found
			return Chains[name];
		}
	}
	// Return EOS as the default network if params.network is not defined
	return Chains.EOS;
}

export function getNetworkFromParams(
	network: string,
	fetchOverride?: typeof window.fetch
): NetworkState {
	const chain = getChainDefinitionFromParams(network);
	const state = getNetwork(chain, fetchOverride);
	return state;
}
