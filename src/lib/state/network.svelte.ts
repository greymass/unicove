import { APIClient, Asset, FetchProvider, Int128, type AssetType } from '@wharfkit/antelope';
import { Chains, ChainDefinition } from '@wharfkit/common';
import { RAMState, Resources, REXState } from '@wharfkit/resources';

import { Types as DelphiOracleTypes } from '$lib/wharf/contracts/delphioracle';

import { wharf, WharfService } from '$lib/wharf/service.svelte';

export class NetworkState {
	public client?: APIClient = $state();
	public fetch: typeof window.fetch = $state(fetch);

	public chain: ChainDefinition = $state(Chains.EOS);
	public last_update: Date = $state(new Date());
	public ramstate?: RAMState = $state();
	public resources?: Resources = $state();
	public rexstate?: REXState = $state();
	public tokenstate?: DelphiOracleTypes.datapoints = $state();

	public ramprice = $derived.by(() => (this.ramstate ? this.ramstate.price_per_kb(1) : undefined));
	public rexprice = $derived.by(() => undefined);
	public tokenprice = $derived.by(() =>
		this.tokenstate ? Asset.fromUnits(this.tokenstate.median, '4,USD') : undefined
	);

	constructor(wharf: WharfService) {
		this.chain = wharf.chain;
		this.client = new APIClient({ url: this.chain.url });
		this.resources = wharf.resources;
	}

	async refresh() {
		if (!this.resources) {
			throw new Error('Resources not initialized');
		}
		const response = await this.fetch('/api/network');
		const json = await response.json();

		this.last_update = new Date();
		this.ramstate = RAMState.from(json.ramstate);
		this.rexstate = REXState.from(json.rexstate);
		this.tokenstate = json.tokenstate;
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

const currentNetwork = $derived(new NetworkState(wharf));

export function getNetwork(fetchOverride?: typeof window.fetch) {
	if (fetchOverride) {
		const fetchProvider = new FetchProvider(currentNetwork.chain.url, { fetch: fetchOverride });
		currentNetwork.fetch = fetchOverride;
		currentNetwork.client = new APIClient(fetchProvider);
	}
	return currentNetwork;
}

export const setChain = (definition: ChainDefinition) => {
	currentNetwork.chain = definition;
};
