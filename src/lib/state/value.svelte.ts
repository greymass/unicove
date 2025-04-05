import type { AccountState } from './client/account.svelte';
import type { MarketState } from './market.svelte';
import type { NetworkState } from './network.svelte';
import type { SettingsState } from './settings.svelte';

import { Currencies } from '$lib/types/currencies';
import { Asset, UInt64 } from '@wharfkit/antelope';
import { calculateValue } from '$lib/utils';
import { Token, TokenPair } from '$lib/types/token';

export interface ValueStates {
	network: NetworkState;
	market: MarketState;
	settings: SettingsState;
}

export interface AccountValueStates extends ValueStates {
	account: AccountState;
}

export interface AccountValueSystemTokenValues {
	// Value of tokens delegated during genesis or the old eosio::delegatebw action
	delegated: Asset;
	// Value of any legacy tokens that have not yet been converted to system tokens
	legacy: Asset;
	// Available token balance for the account on the token contract
	liquid: Asset;
	// Value of RAM owned by the account
	ram: Asset;
	// Tokens being refunded from delegated balances, claimable with eosio::refund
	refunding: Asset;
	// Value of REX balance represented as staked system tokens
	staked: Asset;
	// Sum value of the system token values (minus RAM)
	systemtoken: Asset;
	// Sum of all values
	total: Asset;
	// Value of all non-system tokens owned by the account
	tokens: Asset;
	// System tokens idle in the eosio.rex contract (likely from eosio::sellrex)
	unstaked: Asset;
}

export class AccountValueState {
	readonly states = $state() as AccountValueStates;

	readonly currency = $derived(
		Token.from({ id: Currencies[this.states.settings.data.displayCurrency] })
	);
	readonly pair = $derived(this.states.market.getSystemTokenPair(this.currency));
	readonly hasPrice = $derived(this.price.units.gt(UInt64.from(0)));
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

	readonly currency = $derived(
		Token.from({ id: Currencies[this.states.settings.data.displayCurrency] })
	);

	readonly ram = $derived.by(() => {
		const quote = this.currency;
		const pair = this.states.market.getRAMTokenPair(quote);
		if (!pair) {
			const ramKb = this.states.network.getRamToken();
			return TokenPair.from({
				base: ramKb,
				quote: this.states.network.token,
				price: Asset.fromUnits(0, quote.symbol),
				updated: new Date()
			});
		}
		return pair;
	});

	// Currently hardcoded to use the systemtoken price for the legacytoken
	readonly legacytoken = $derived.by(() => {
		if (!this.states.network.legacytoken) {
			return undefined;
		}
		const quote = this.currency;
		const pair = this.states.market.getSystemTokenPair(quote);
		if (!pair) {
			return TokenPair.from({
				base: this.states.network.legacytoken,
				quote,
				price: Asset.fromUnits(0, quote.symbol),
				updated: new Date()
			});
		}
		return TokenPair.from({
			...pair,
			base: this.states.network.legacytoken
		});
	});

	readonly systemtoken = $derived.by(() => {
		const quote = this.currency;
		const pair = this.states.market.getSystemTokenPair(quote);
		if (!pair) {
			return TokenPair.from({
				base: this.states.network.token,
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
			legacytoken: this.legacytoken,
			systemtoken: this.systemtoken
		};
	}
}

export function getAccountValue(
	states: AccountValueStates,
	currency: Token
): AccountValueSystemTokenValues {
	const systemTokenPair = states.market.getSystemTokenPair(currency);
	const systemTokenPrice = systemTokenPair
		? systemTokenPair.price
		: Asset.fromUnits(0, currency.symbol);

	const delegated = Asset.fromUnits(0, currency.symbol);
	const legacy = Asset.fromUnits(0, currency.symbol);
	const liquid = Asset.fromUnits(0, currency.symbol);
	const ram = Asset.fromUnits(0, currency.symbol);
	const refunding = Asset.fromUnits(0, currency.symbol);
	const staked = Asset.fromUnits(0, currency.symbol);
	const unstaked = Asset.fromUnits(0, currency.symbol);
	const systemtoken = Asset.fromUnits(0, currency.symbol);
	const tokens = Asset.fromUnits(0, currency.symbol);
	const total = Asset.fromUnits(0, currency.symbol);

	if (states.account.balance && systemTokenPrice.units.gt(UInt64.from(0))) {
		delegated.units.add(
			calculateValue(states.account.balance.child('delegated').balance, systemTokenPrice).units
		);
		legacy.units.add(
			calculateValue(states.account.balance.child('legacy').balance, systemTokenPrice).units
		);
		liquid.units.add(calculateValue(states.account.balance.balance, systemTokenPrice).units);
		staked.units.add(
			calculateValue(states.account.balance.child('staked').balance, systemTokenPrice).units
		);
		refunding.units.add(
			calculateValue(states.account.balance.child('refunding').balance, systemTokenPrice).units
		);
		unstaked.units.add(
			calculateValue(states.account.balance.child('unstaked').balance, systemTokenPrice).units
		);
		systemtoken.units.add(
			calculateValue(states.account.balance.child('total').balance, systemTokenPrice).units
		);
		total.units.add(
			calculateValue(states.account.balance.child('total').balance, systemTokenPrice).units
		);
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
		legacy,
		liquid,
		ram,
		refunding,
		staked,
		unstaked,
		systemtoken,
		tokens,
		total
	};
}
