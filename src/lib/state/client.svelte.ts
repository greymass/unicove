import type { AccountState } from './client/account.svelte';

export interface UnicoveContext {
	account: AccountState | undefined;
}
