import type { AccountState } from './client/account.svelte';
import type { MarketState } from './market.svelte';
import type { NetworkState } from './network.svelte';
import type { SettingsState } from './settings.svelte';

import { Currencies, ramKb } from '$lib/types/currencies';
import { Asset, UInt64 } from '@wharfkit/antelope';
import { calculateValue } from '$lib/utils';
import { TokenPair, type TokenDefinition } from '$lib/types/token';

export interface ValueStates {
	network: NetworkState;
	market: MarketState;
	settings: SettingsState;
}

export interface AccountValueStates extends ValueStates {
	account: AccountState;
}

export interface AccountValueSystemTokenValues {
	delegated: Asset;
	liquid: Asset;
	ram: Asset;
	refunding: Asset;
	staked: Asset;
	systemtoken: Asset;
	total: Asset;
	unstaked: Asset;
}

export class AccountValueState {
	readonly states = $state() as AccountValueStates;

	readonly currency = $derived(Currencies[this.states.settings.data.displayCurrency]);
	readonly pair = $derived(this.states.market.getSystemTokenPair(this.currency));
	readonly systemtoken: AccountValueSystemTokenValues = $derived(
		getAccountValue(this.states, this.currency)
	);

	constructor(args: AccountValueStates) {
		this.states = {
			network: args.network,
			account: args.account,
			market: args.market,
			settings: args.settings
		};
	}

	get price() {
		if (!this.pair) {
			return Asset.fromUnits(0, this.currency.symbol);
		}
		return this.pair.price;
	}

	toJSON() {
		return {
			currency: this.currency,
			systemtoken: this.systemtoken
		};
	}
}

export class NetworkValueState {
	readonly states = $state() as ValueStates;

	readonly currency = $derived(Currencies[this.states.settings.data.displayCurrency]);

	readonly ram = $derived.by(() => {
		const quote = this.currency;
		const pair = this.states.market.getRAMTokenPair(quote);
		if (!pair) {
			return TokenPair.from({
				base: ramKb,
				quote: this.states.network.token.id,
				price: Asset.fromUnits(0, quote.symbol),
				updated: new Date()
			});
		}
		return pair;
	});

	readonly systemtoken = $derived.by(() => {
		const quote = this.currency;
		const pair = this.states.market.getSystemTokenPair(quote);
		if (!pair) {
			return TokenPair.from({
				base: this.states.network.token.id,
				quote,
				price: Asset.fromUnits(0, quote.symbol),
				updated: new Date()
			});
		}
		return pair;
	});

	constructor(args: ValueStates) {
		this.states = {
			network: args.network,
			market: args.market,
			settings: args.settings
		};
	}

	toJSON() {
		return {
			currency: this.currency,
			systemtoken: this.systemtoken
		};
	}
}

export function getAccountValue(
	states: AccountValueStates,
	currency: TokenDefinition
): AccountValueSystemTokenValues {
	const systemTokenPair = states.market.getSystemTokenPair(currency);
	const systemTokenPrice = systemTokenPair
		? systemTokenPair.price
		: Asset.fromUnits(0, currency.symbol);

	const delegated = Asset.fromUnits(0, currency.symbol);
	const liquid = Asset.fromUnits(0, currency.symbol);
	const ram = Asset.fromUnits(0, currency.symbol);
	const refunding = Asset.fromUnits(0, currency.symbol);
	const staked = Asset.fromUnits(0, currency.symbol);
	const unstaked = Asset.fromUnits(0, currency.symbol);
	const systemtoken = Asset.fromUnits(0, currency.symbol);
	const total = Asset.fromUnits(0, currency.symbol);

	if (states.account.balance && systemTokenPrice.units.gt(UInt64.from(0))) {
		delegated.units.add(calculateValue(states.account.balance.delegated, systemTokenPrice).units);
		liquid.units.add(calculateValue(states.account.balance.liquid, systemTokenPrice).units);
		staked.units.add(calculateValue(states.account.balance.staked, systemTokenPrice).units);
		refunding.units.add(calculateValue(states.account.balance.refunding, systemTokenPrice).units);
		unstaked.units.add(calculateValue(states.account.balance.unstaked, systemTokenPrice).units);
		systemtoken.units.add(calculateValue(states.account.balance.total, systemTokenPrice).units);
		total.units.add(calculateValue(states.account.balance.total, systemTokenPrice).units);
		if (states.network.resources.ram.price.rammarket) {
			const ramAsset = Asset.fromUnits(states.account.resources.ram.owned, '3,KB');
			const ramValue = calculateValue(ramAsset, states.network.resources.ram.price.rammarket);
			const ramUsdValue = calculateValue(ramValue, systemTokenPrice);
			ram.units.add(ramUsdValue.units);
			total.units.add(ramUsdValue.units);
		}
	}

	return {
		delegated,
		liquid,
		ram,
		refunding,
		staked,
		unstaked,
		systemtoken,
		total
	};
}
