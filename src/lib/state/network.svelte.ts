import {
	APIClient,
	Asset,
	FetchProvider,
	Int128,
	Struct,
	UInt64,
	type AssetType
} from '@wharfkit/antelope';
import { ChainDefinition, TokenMeta, TokenIdentifier } from '@wharfkit/common';
import { RAMState, Resources as ResourceClient, REXState, PowerUpState } from '@wharfkit/resources';
import { ABICache } from '@wharfkit/session';
import { snapOrigins } from '@wharfkit/wallet-plugin-metamask';

import { Contract as DelphiOracleContract } from '$lib/wharf/contracts/delphioracle';
import { Contract as MSIGContract } from '$lib/wharf/contracts/msig';
import { Contract as SystemContract, Types as SystemTypes } from '$lib/wharf/contracts/system';
import { Contract as TokenContract } from '$lib/wharf/contracts/token';
import { Contract as UnicoveContract, Types as UnicoveTypes } from '$lib/wharf/contracts/unicove';

import {
	chainMapper,
	getChainDefinitionFromParams,
	type ChainConfig,
	type DefaultContracts,
	type FeatureType,
	getChainConfigByName
} from '$lib/wharf/chains';

import { calculateValue } from '$lib/utils';
import { NetworkDataSources } from '$lib/types';

export interface NetworkStateOptions {
	fetch?: typeof fetch;
	client?: APIClient;
}

@Struct.type('distribution')
export class SystemTokenDistribution extends Struct {
	@Struct.field(Asset) declare circulating: Asset;
	@Struct.field(Asset) declare locked: Asset;
	@Struct.field(Asset) declare staked: Asset;
	@Struct.field(Asset) declare supply: Asset;
	@Struct.field(Asset) declare max: Asset;
}

@Struct.type('systemtoken')
export class SystemToken extends Struct {
	@Struct.field(UnicoveTypes.token_definition) declare definition: UnicoveTypes.token_definition;
	@Struct.field(SystemTokenDistribution) declare distribution: SystemTokenDistribution;
	@Struct.field(Asset) declare marketcap: Asset;
	@Struct.field(Asset) declare price: Asset;
}

export interface SystemResourceCPUNET {
	price: SystemResourceSourcesCPUNET;
}

export interface SystemResourceRAM {
	price: SystemResourceSourcesRAM;
	supply: UInt64;
}

export interface SystemResources {
	cpu: SystemResourceCPUNET;
	net: SystemResourceCPUNET;
	ram: SystemResourceRAM;
}

export interface SystemResourceSourcesCPUNET {
	powerup: Asset;
	rex: Asset;
	staking: Asset;
}

export interface SystemResourceSourcesRAM {
	rammarket: Asset;
}

export class NetworkState {
	private sources?: NetworkDataSources = $state();

	public client: APIClient;
	public chain: ChainDefinition;
	public config: ChainConfig;
	public fetch = fetch;
	public last_update: Date = $state(new Date());
	public loaded = $state(false);
	public shortname: string;
	public snapOrigin?: string = $state();

	public contracts: DefaultContracts;

	public abis?: ABICache = $state();
	public global?: SystemTypes.eosio_global_state = $state();

	public resources: SystemResources = $state() as SystemResources;
	public resourceClient?: ResourceClient = $state();

	public token: SystemToken = $state() as SystemToken;
	public tokenmeta?: TokenMeta[] = $state();
	public tvl?: Asset = $state();

	constructor(config: ChainConfig, options: NetworkStateOptions = {}) {
		this.config = config;
		this.chain = getChainDefinitionFromParams(config.name);
		this.shortname = chainMapper.toShortName(String(this.chain.id));
		this.snapOrigin = snapOrigins.get(this.shortname);
		this.tokenmeta = this.config.tokens.map((token) =>
			TokenMeta.from({
				id: TokenIdentifier.from({
					chain: this.chain.id,
					...token
				})
			})
		);

		if (options.fetch) {
			this.fetch = options.fetch;
		}

		const price = Asset.fromUnits(0, '4,USD');
		this.token = SystemToken.from({
			definition: UnicoveTypes.token_definition.from({
				contract: 'eosio.token',
				symbol: this.config.systemtoken.symbol
			}),
			distribution: {
				circulating: Asset.fromUnits(0, this.config.systemtoken.symbol),
				locked: Asset.fromUnits(0, this.config.systemtoken.symbol),
				staked: Asset.fromUnits(0, this.config.systemtoken.symbol),
				supply: Asset.fromUnits(0, this.config.systemtoken.symbol),
				max: Asset.fromUnits(0, this.config.systemtoken.symbol)
			},
			marketcap: calculateValue(Asset.fromUnits(0, this.config.systemtoken.symbol), price),
			price
		});
		this.resources = this.getResources();

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

		this.resourceClient = new ResourceClient({
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
		this.sources = NetworkDataSources.from(json);
		this.last_update = new Date();

		const { circulating, def, supply, locked, max } = this.sources.token;

		const price = Asset.fromUnits(this.sources.oracle?.median || 0, '4,USD');

		this.token = SystemToken.from({
			definition: def,
			distribution: {
				circulating,
				locked,
				staked: this.sources.rex.total_lendable,
				supply,
				max
			},
			marketcap: calculateValue(circulating, price),
			price
		});

		this.resources = this.getResources();
		this.tvl = this.calculateTvl();

		this.loaded = true;
	}

	supports = (feature: FeatureType): boolean => this.config.features[feature];

	tokenToRex = (token: AssetType) => {
		if (!this.sources?.rex) {
			throw new Error('REX state not initialized');
		}
		const asset = Asset.from(token);
		const { total_lendable, total_rex } = REXState.from(this.sources.rex);
		const S1 = total_lendable.units.adding(asset.units);
		const R1 = Int128.from(S1).multiplying(total_rex.units).dividing(total_lendable.units);
		const result = R1.subtracting(total_rex.units);
		return Asset.fromUnits(result, total_rex.symbol);
	};

	rexToToken = (rex: AssetType) => {
		if (!this.sources?.rex) {
			throw new Error('REX state not initialized');
		}
		const asset = Asset.from(rex);
		const { total_lendable, total_rex } = REXState.from(this.sources.rex);
		const R1 = total_rex.units.adding(asset.units);
		const S1 = Int128.from(R1).multiplying(total_lendable.units).dividing(total_rex.units);
		const result = S1.subtracting(total_lendable.units);
		return Asset.fromUnits(result, total_lendable.symbol);
	};

	getPowerupFrac = (cpu: number, net: number): [number, number] => {
		if (!this.sources?.powerup) {
			throw new Error('PowerUp state not initialized');
		}
		if (!this.sources?.sample) {
			throw new Error('PowerUp state not initialized');
		}
		const powerup = PowerUpState.from(this.sources?.powerup);
		return [
			powerup.cpu.frac_by_ms(this.sources.sample, cpu),
			powerup.net.frac_by_kb(this.sources.sample, net)
		];
	};

	getResources(): SystemResources {
		const defaultValue = Asset.fromUnits(0, this.token.definition.symbol);
		const response: SystemResources = {
			cpu: {
				price: {
					powerup: defaultValue,
					rex: defaultValue,
					staking: defaultValue
				}
			},
			net: {
				price: {
					powerup: defaultValue,
					rex: defaultValue,
					staking: defaultValue
				}
			},
			ram: {
				price: {
					rammarket: defaultValue
				},
				supply: UInt64.from(0)
			}
		};

		if (this.sources?.global) {
			response.ram.supply = this.sources.global.max_ram_size;
		}

		if (this.supports('rammarket') && this.sources?.ram) {
			response.ram.price.rammarket = RAMState.from(this.sources.ram).price_per_kb(1);
		}

		if (this.supports('powerup') && this.sources?.powerup && this.sources?.sample) {
			const pstate = PowerUpState.from(this.sources.powerup);
			response.cpu.price.powerup = Asset.from(
				pstate.cpu.price_per_ms(this.sources.sample, 1),
				this.token.definition.symbol
			);
			response.net.price.powerup = Asset.from(
				pstate.net.price_per_kb(this.sources.sample, 1),
				this.token.definition.symbol
			);
		}

		if (this.supports('rentrex') && this.sources?.rex && this.sources?.sample) {
			const rstate = REXState.from(this.sources.rex);
			response.cpu.price.rex = Asset.from(
				rstate.cpu_price_per_ms(this.sources.sample, 30),
				this.token.definition.symbol
			);
			response.net.price.rex = Asset.from(
				rstate.net_price_per_kb(this.sources.sample, 30),
				this.token.definition.symbol
			);
		}

		if (this.supports('stakeresource') && this.sources?.sample) {
			const account = this.sources.sample.account;
			const cpuPrice = account.cpu_weight.multiplying(1000).dividing(account.cpu_limit.max);
			const netPrice = account.net_weight.multiplying(1000).dividing(account.net_limit.max);
			response.cpu.price.staking = Asset.fromUnits(cpuPrice, this.token.definition.symbol);
			response.net.price.staking = Asset.fromUnits(netPrice, this.token.definition.symbol);
		}

		return response;
	}

	calculateTvl(): Asset {
		const token = Asset.fromUnits(0, this.chain.systemToken!.symbol);
		if (this.supports('rex') && this.sources?.rex) {
			token.units.add(this.sources.rex.total_lendable.units);
		}
		if (this.supports('rammarket') && this.sources?.ram) {
			token.units.add(this.sources.ram.quote.balance.units);
		}
		if (this.token.price.units.gt(UInt64.from(0))) {
			return calculateValue(token, this.token.price);
		}
		return token;
	}

	toString() {
		return this.shortname;
	}

	toJSON() {
		return {
			abis: this.abis?.cache,
			chain: this.chain,
			config: this.config,
			last_update: this.last_update,
			loaded: this.loaded,
			resources: this.resources,
			shortname: this.shortname,
			snapOrigins: this.snapOrigin,
			token: this.token,
			tokenmeta: this.tokenmeta,
			tvl: this.tvl
		};
	}
}

export function getNetwork(config: ChainConfig, options: NetworkStateOptions = {}): NetworkState {
	return new NetworkState(config, options);
}

export function getNetworkFromParams(network: string, fetch?: typeof window.fetch): NetworkState {
	const config = getChainConfigByName(network);
	const state = getNetwork(config, { fetch });
	return state;
}
