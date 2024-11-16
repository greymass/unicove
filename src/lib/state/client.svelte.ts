import type { AccountState } from './client/account.svelte';
import type { NetworkState } from './network.svelte';
import type { WharfState } from './client/wharf.svelte';

export interface UnicoveContext {
	account: AccountState | undefined;
	network: NetworkState | undefined;
	wharf: WharfState;
}
