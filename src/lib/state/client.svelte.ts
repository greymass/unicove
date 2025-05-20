import type { AccountState } from './client/account.svelte';
import type { AccountValueState, NetworkValueState } from './value.svelte';
import type { MarketState } from './market.svelte';
import type { MetaState } from './meta.svelte';
import type { NetworkState } from './network.svelte';
import type { SearchRecordStorage } from './search.svelte';
import type { SettingsState } from './settings.svelte';
import type { WharfState } from './client/wharf.svelte';

export interface UnicoveContext {
	account: AccountState | undefined;
	history: SearchRecordStorage;
	meta: MetaState;
	network: NetworkState;
	settings: SettingsState;
	wharf: WharfState;
}

export interface MarketContext {
	account: AccountValueState | undefined;
	market: MarketState;
	network: NetworkValueState;
}
