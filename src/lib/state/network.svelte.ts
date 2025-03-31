import {
	Action,
	APIClient,
	Asset,
	FetchProvider,
	Int128,
	Serializer,
	UInt64,
	type ABISerializable,
	type AssetType
} from '@wharfkit/antelope';
import { ChainDefinition } from '@wharfkit/common';
import { RAMState, Resources as ResourceClient, REXState, PowerUpState } from '@wharfkit/resources';
import { ABICache } from '@wharfkit/abicache';
import { snapOrigins } from '@wharfkit/wallet-plugin-metamask';

import {
	NetworkDataSources,
	type ChainConnectionState,
	type NetworkStateOptions,
	type SerializedNetworkState,
	type SystemResources
} from '$lib/types/network';

import {
	chainMapper,
	getChainDefinitionFromParams,
	type ChainConfig,
	type DefaultContracts,
	type FeatureType,
	getChainConfigByName
} from '$lib/wharf/chains';

import { type TokenType, TokenDistribution, Token, TokenDefinition } from '$lib/types/token';

import { Contract as DelphiHelperContract } from '$lib/wharf/contracts/delphihelper';
import { Contract as DelphiOracleContract } from '$lib/wharf/contracts/delphioracle';
import { Contract as MSIGContract } from '$lib/wharf/contracts/msig';
import { Contract as SystemContract } from '$lib/wharf/contracts/system';
import { Contract as TimeContract } from '$lib/wharf/contracts/eosntime';
import { Contract as TokenContract } from '$lib/wharf/contracts/token';
import { Contract as UnicoveContract } from '$lib/wharf/contracts/unicove.api';
import type { ObjectifiedActionData } from '$lib/types/transaction';
import { PUBLIC_FEATURE_UNICOVE_CONTRACT_API } from '$env/static/public';

export class NetworkState {
	// Readonly state
	readonly client: APIClient;
	readonly chain: ChainDefinition;
	readonly config: ChainConfig;
	readonly contracts: DefaultContracts;
	readonly fetch = fetch;
	readonly shortname: string;
	readonly snapOrigin?: string;
	readonly resourceClient: ResourceClient;

	// Raw data sources used to populate network state
	private sources?: NetworkDataSources = $state();

	// Derived network state
	readonly resources = $derived(this.getResources());
	readonly rex = $derived(this.getRexState());
	readonly token = $derived.by(() => this.getSystemToken());

	// Writable state
	public abis?: ABICache = $state();
	public connection: ChainConnectionState = $state({
		connected: false,
		endpoint: '',
		updated: new Date()
	});
	public loaded = $state(false);
	public tokens: Token[] = $state([]);

	constructor(config: ChainConfig, options: NetworkStateOptions = {}) {
		this.config = config;
		this.chain = getChainDefinitionFromParams(config.name);
		this.shortname = chainMapper.toShortName(String(this.chain.id));
		this.snapOrigin = snapOrigins.get(this.shortname);

		if (options.fetch) {
			this.fetch = options.fetch;
		}

		if (options.client) {
			this.client = options.client;
		} else {
			this.client = new APIClient(
				new FetchProvider(this.config.endpoints.api, {
					fetch: this.fetch
				})
			);
		}

		this.abis = new ABICache(this.client);
		this.resourceClient = new ResourceClient({
			api: this.client,
			sampleAccount: 'eosio.reserv',
			symbol: String(this.config.systemtoken.symbol)
		});
		this.connection.endpoint = (this.client.provider as FetchProvider).url;

		this.contracts = {
			delphihelper: new DelphiHelperContract({ client: this.client }),
			delphioracle: new DelphiOracleContract({ client: this.client }),
			eosntime: new TimeContract({ client: this.client }),
			msig: new MSIGContract({ client: this.client }),
			system: new SystemContract({ client: this.client }),
			token: new TokenContract({ client: this.client }),
			unicove: new UnicoveContract({
				account: PUBLIC_FEATURE_UNICOVE_CONTRACT_API,
				client: this.client
			})
		};
	}

	get serialized(): SerializedNetworkState {
		return {
			config: this.config,
			sources: this.sources
		};
	}

	static restore(
		serialized: SerializedNetworkState,
		options: NetworkStateOptions = {}
	): NetworkState {
		const state = new NetworkState(serialized.config, options);
		if (serialized.sources) {
			state.setState(serialized.sources);
		}
		return state;
	}

	public setState(state: NetworkDataSources) {
		this.sources = NetworkDataSources.from(state);
	}

	public async refresh() {
		const response = await this.fetch(
			`/${chainMapper.toShortName(String(this.chain.id))}/api/network`
		);
		this.connection.updated = new Date();
		if (response.ok) {
			this.connection.connected = true;
			const json = await response.json();
			this.setState(json);
			this.loaded = true;
		} else {
			this.connection.connected = false;
		}
	}

	get legacytoken(): Token | undefined {
		if (!this.config.legacytoken) {
			return undefined;
		}
		return Token.from({
			id: {
				chain: this.chain.id,
				symbol: this.config.legacytoken.symbol,
				contract: this.config.legacytoken.contract
			}
		});
	}

	getRamTokenDefinition(): TokenDefinition {
		return TokenDefinition.from({
			symbol: Asset.Symbol.from('3,KB'),
			contract: 'eosio',
			chain: this.chain.id
		});
	}

	getSystemToken(): Token {
		const id = TokenDefinition.from({
			chain: this.chain.id,
			symbol: this.config.systemtoken.symbol,
			contract: this.config.systemtoken.contract
		});

		const tokenData: TokenType = {
			id
		};

		if (this.sources) {
			tokenData.distribution = TokenDistribution.from({
				circulating: this.sources.token.circulating,
				locked: this.sources.token.locked,
				staked:
					this.sources.rex?.total_lendable || Asset.fromUnits(0, this.config.systemtoken.symbol),
				supply: this.sources.token.supply,
				max: this.sources.token.max
			});
		}

		return Token.from(tokenData);
	}

	getRexState() {
		if (this.sources?.rex) {
			return REXState.from(this.sources.rex);
		}
		return this.defaultRexState;
	}

	get defaultRexState(): REXState {
		return REXState.from({
			loan_num: 0,
			namebid_proceeds: Asset.fromUnits(0, this.config.systemtoken.symbol),
			total_lendable: Asset.fromUnits(0, this.config.systemtoken.symbol),
			total_lent: Asset.fromUnits(0, this.config.systemtoken.symbol),
			total_rent: Asset.fromUnits(0, this.config.systemtoken.symbol),
			total_rex: Asset.fromUnits(0, this.config.systemtoken.symbol),
			total_unlent: Asset.fromUnits(0, this.config.systemtoken.symbol),
			version: 0
		});
	}

	supports = (feature: FeatureType): boolean => this.config.features[feature];

	tokenToRex = (token: AssetType): Asset => {
		if (!this.supports('rex')) {
			throw new Error(`The ${this.shortname} network does not support REX.`);
		}
		const asset = Asset.from(token);
		const { total_lendable, total_rex } = this.rex;
		const S1 = total_lendable.units.adding(asset.units);
		const R1 = Int128.from(S1).multiplying(total_rex.units).dividing(total_lendable.units);
		const result = R1.subtracting(total_rex.units);
		return Asset.fromUnits(result, total_rex.symbol);
	};

	rexToToken = (rex: AssetType): Asset => {
		if (!this.supports('rex')) {
			throw new Error(`The ${this.shortname} network does not support REX.`);
		}
		const asset = Asset.from(rex);
		const { total_lendable, total_rex } = this.rex;
		const R1 = total_rex.units.adding(asset.units);
		const S1 = Int128.from(R1).multiplying(total_lendable.units).dividing(total_rex.units);
		const result = S1.subtracting(total_lendable.units);
		return Asset.fromUnits(result, total_lendable.symbol);
	};

	getPowerupFrac = (cpu: number, net: number): [number, number] => {
		if (!this.supports('powerup')) {
			throw new Error(`The ${this.shortname} network does not support powerup.`);
		}
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
		const defaultValue = Asset.fromUnits(0, this.token.symbol);
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
				supply: UInt64.from(0),
				gift: UInt64.from(this.sources ? this.sources.ram_gift_bytes : 0)
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
				this.token.symbol
			);
			response.net.price.powerup = Asset.from(
				pstate.net.price_per_kb(this.sources.sample, 1),
				this.token.symbol
			);
		}

		if (this.supports('rentrex') && this.rex && this.sources?.sample) {
			response.cpu.price.rex = Asset.from(
				this.rex.cpu_price_per_ms(this.sources.sample, 30),
				this.token.symbol
			);
			response.net.price.rex = Asset.from(
				this.rex.net_price_per_kb(this.sources.sample, 30),
				this.token.symbol
			);
		}

		if (this.supports('stakeresource') && this.sources?.sample) {
			const account = this.sources.sample.account;
			const cpuPrice = account.cpu_weight.multiplying(1000).dividing(account.cpu_limit.max);
			const netPrice = account.net_weight.multiplying(1000).dividing(account.net_limit.max);
			response.cpu.price.staking = Asset.fromUnits(cpuPrice, this.token.symbol);
			response.net.price.staking = Asset.fromUnits(netPrice, this.token.symbol);
		}

		return response;
	}

	async decodeAction(action: Action): Promise<ABISerializable> {
		const abi = await this.abis?.getAbi(action.account);
		return Serializer.decode({
			data: action.data,
			type: String(action.name),
			abi: abi
		});
	}

	async objectifyAction(action: Action): Promise<ObjectifiedActionData> {
		return Serializer.objectify(await this.decodeAction(action));
	}

	toString() {
		return this.shortname;
	}

	toJSON() {
		return {
			abis: this.abis?.cache,
			chain: this.chain,
			config: this.config,
			connection: this.connection,
			loaded: this.loaded,
			resources: this.resources,
			shortname: this.shortname,
			snapOrigins: this.snapOrigin,
			token: this.token,
			tokens: this.tokens
		};
	}
}

export function getNetwork(config: ChainConfig, options: NetworkStateOptions = {}): NetworkState {
	return new NetworkState(config, options);
}

export function getNetworkByName(name: string, fetch?: typeof window.fetch): NetworkState {
	const config = getChainConfigByName(name);
	const state = getNetwork(config, { fetch });
	return state;
}
