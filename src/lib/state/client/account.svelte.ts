import { API, APIClient, Name } from '@wharfkit/antelope';
import { ChainDefinition } from '@wharfkit/common';
import { getContext, setContext } from 'svelte';

import { chainMapper } from '$lib/wharf/chains';
import type { Session } from '@wharfkit/session';

export class AccountState {
	public client?: APIClient = $state();
	public fetch = $state(fetch);

	public account_data: API.v1.AccountObject | undefined = $state();
	public chain: ChainDefinition | undefined = $state();
	public name: Name | undefined = $state();
	public last_update: Date = $state(new Date());

	constructor(fetchOverride?: typeof fetch) {
		if (fetchOverride) {
			this.fetch = fetchOverride;
		}
	}

	async load(session: Session) {
		this.chain = session.chain;
		this.name = session.actor;
		await this.refresh();
	}

	async clear() {
		this.last_update = new Date();
		this.account_data = undefined;
		this.name = undefined;
		this.chain = undefined;
	}

	async refresh() {
		const response = await this.fetch(
			`/api/${chainMapper.toShortName(String(this.chain.id))}/account/${this.name}`
		);
		const json = await response.json();
		this.last_update = new Date();
		this.account_data = json.account_data;
	}

	toJSON() {
		return {
			chain: this.chain,
			name: this.name,
			last_update: this.last_update,
			account_data: this.account_data
		};
	}
}

const contextKey = 'account';
export function getAccount(): AccountState {
	if (!getContext(contextKey)) {
		setContext(contextKey, new AccountState());
	}
	return getContext(contextKey);
}
