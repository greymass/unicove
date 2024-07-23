import { browser } from '$app/environment';
import { getClient } from '$lib/wharf/client';
import { APIClient, Asset, Int128, type AssetType } from '@wharfkit/antelope';
import { Chains, ChainDefinition } from '@wharfkit/common';
import { RAMState, Resources, REXState } from '@wharfkit/resources';

export class NetworkState {
	public chain: ChainDefinition = $state(Chains.Jungle4);

	public last_update: Date = $state(new Date());

	public resources: Resources | undefined = $state();

	public rammarket: RAMState | undefined = $state();
	public ramprice = $derived.by(() => {
		if (this.rammarket) {
			return this.rammarket.price_per_kb(1);
		}
		return 0;
	});

	public rexstate: REXState | undefined = $state();
	public rexprice = $derived.by(() => {
		if (this.rexstate) {
			// return this.rexstate
		}
		return 0;
	});

	constructor(chain: ChainDefinition) {
		this.chain = chain;
	}

	async init() {
		if (!browser) {
			throw new Error('Wharf should only be used in the browser');
		}

		const chain = Chains.Jungle4;
		const client = new APIClient({ url: 'https://eos.greymass.com' });
		this.resources = new Resources({
			api: client,
			sampleAccount: 'eosio.reserv'
		});

		await this.refresh();
	}

	async refresh() {
		if (!this.resources) {
			throw new Error('Resources not initialized');
		}
		this.last_update = new Date();
		this.rammarket = await this.resources.v1.ram.get_state();
		this.rexstate = await this.resources.v1.rex.get_state();
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
			rammarket: this.rammarket,
			ramprice: this.ramprice,
			rexstate: this.rexstate,
			sampleAccount: this.resources?.sampleAccount
		};
	}
}

export const network = new NetworkState(Chains.Jungle4);

export const setChain = (definition: ChainDefinition) => {
	network.chain = definition;
};
