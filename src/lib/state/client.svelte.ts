import type { AccountState } from './client/account.svelte';
import type { NetworkState } from './network.svelte';
import type { WharfState } from './client/wharf.svelte';
import type { SearchRecordStorage } from './search.svelte';

export interface UnicoveContext {
	account: AccountState | undefined;
	history: SearchRecordStorage;
	network: NetworkState;
	wharf: WharfState;
}
