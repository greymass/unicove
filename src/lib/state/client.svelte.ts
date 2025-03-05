import type { AccountState } from './client/account.svelte';
import type { NetworkState } from './network.svelte';
import type { SearchRecordStorage } from './search.svelte';
import type { MarketState } from './market.svelte';
import type { SettingsState } from './settings.svelte';
import type { WharfState } from './client/wharf.svelte';
import type { AccountValueState, NetworkValueState } from './value.svelte';

export interface UnicoveContext {
	account: AccountState | undefined;
	history: SearchRecordStorage;
	network: NetworkState;
	settings: SettingsState;
	wharf: WharfState;
}

export interface MarketContext {
	account: AccountValueState | undefined;
	market: MarketState;
	network: NetworkValueState;
}
