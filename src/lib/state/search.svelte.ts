import { Name, PublicKey, UInt32, Checksum256 } from '@wharfkit/antelope';
import { browser } from '$app/environment';
import type { NetworkState } from './network.svelte';
import type { UnicoveContext } from './client.svelte';
import type { WharfState } from './client/wharf.svelte';
import * as m from '$lib/paraglide/messages';

export type SearchResult = {
	result: string;
	searchType: string;
	searchValue: string;
};

export enum SearchRecordType {
	// View an account
	ACCOUNT = 'account',
	// View a block
	BLOCK = 'block',
	// Clear all search history
	CLEAR = 'clear',
	// View a contract
	CONTRACT = 'contract',
	// View a key
	KEY = 'key',
	// Visit a page
	PAGE = 'page',
	// Switch to an account
	SWITCH = 'switch',
	// View a transaction
	TRANSACTION = 'transaction',
	// Unknown type, error?
	UNKNOWN = 'unknown'
}

export interface SearchRecord {
	type: SearchRecordType;
	data?: unknown; // arbitrary data field
	value: string;
	keywords?: string[];
	description?: string;
	url: string;
}

// TODO: Potential new interfaces for different types of records
// export interface Command extends Record {}
// export interface Favorite extends Record {}

export const SearchCommands: SearchRecord[] = [
	{
		value: 'RAM Market',
		type: SearchRecordType.PAGE,
		keywords: ['ram'],
		description: m.search_result_description_ram(),
		url: '/ram'
	},
	{
		value: 'Buy RAM',
		type: SearchRecordType.PAGE,
		keywords: ['ram', 'buy'],
		description: m.search_result_description_buyram(),
		url: '/ram/buy'
	},
	{
		value: 'Sell RAM',
		type: SearchRecordType.PAGE,
		keywords: ['ram', 'sell'],
		description: m.search_result_description_sellram(),
		url: '/ram/sell'
	},
	{
		value: 'Send',
		type: SearchRecordType.PAGE,
		keywords: ['send', 'transfer'],
		description: m.search_result_description_transfer(),
		url: '/send'
	},
	{
		value: 'Settings',
		type: SearchRecordType.PAGE,
		keywords: ['settings', 'preferences'],
		description: m.search_result_description_settings(),
		url: '/settings'
	},
	{
		value: 'Staking',
		type: SearchRecordType.PAGE,
		keywords: ['staking', 'stake'],
		description: m.search_result_description_staking(),
		url: '/staking'
	},
	{
		value: 'Stake',
		type: SearchRecordType.PAGE,
		keywords: ['stake'],
		description: m.common_stake_action(),
		url: '/staking/stake'
	},
	{
		value: 'Unstake',
		type: SearchRecordType.PAGE,
		keywords: ['unstake'],
		description: m.common_unstake_action(),
		url: '/staking/unstake'
	},
	{
		value: 'Resources',
		type: SearchRecordType.PAGE,
		keywords: ['resources', 'cpu', 'net', 'powerup'],
		description: m.common_resources_action(),
		url: '/resources'
	},
	{
		value: 'Clear',
		type: SearchRecordType.CLEAR,
		description: m.search_result_description_clear(),
		keywords: ['clear', 'history'],
		url: ''
	}
];

export function search(context: UnicoveContext, query: string): SearchRecord[] {
	const results: SearchRecord[] = [];

	// Listing of the currently logged in accounts for quick switching
	if (context.settings.data.searchAccountSwitch) {
		results.push(...searchAccounts(query, context.network, context.wharf));
	}

	// Page suggestions based on the input
	if (context.settings.data.searchShowPages) {
		results.push(...searchCommands(query, context.network));
	}

	// Search commands for matching keywords
	results.push(...searchSuggestions(query, context.network));

	// Search recent history
	results.push(...searchHistory(query, context.history));

	return results;
}

export function searchAccounts(
	query: string,
	network: NetworkState,
	wharf: WharfState
): SearchRecord[] {
	return wharf.sessions
		.filter((s) => network.chain.id.equals(s.chain))
		.filter((s) => String(s.actor).includes(query.trim().toLowerCase()))
		.map((s) => ({
			data: s,
			description: m.common_switch_account(),
			type: SearchRecordType.SWITCH,
			value: `${s.actor}@${s.permission}`,
			url: `/${network}/account/${s.actor}`
		}));
}

export function searchSuggestions(query: string, network: NetworkState): SearchRecord[] {
	return getPossibleSearchTypes(query).map((type) => ({
		type,
		value: query,
		url: `/${network}/${type}/${query}`
	}));
}

export function searchCommands(query: string, network: NetworkState): SearchRecord[] {
	return SearchCommands.filter((c) =>
		c.keywords?.some((keyword) => keyword.toLowerCase().includes(query.trim().toLowerCase()))
	).map((c) => ({
		...c,
		url: `/${network}${c.url}`
	}));
}

export function searchHistory(query: string, recentHistory: SearchRecordStorage): SearchRecord[] {
	const history = recentHistory.get();
	return history
		.filter((r) => r.type !== SearchRecordType.PAGE)
		.filter((r) => r.value.includes(query.trim().toLowerCase()));
}

export function getPossibleSearchTypes(value: string): SearchRecordType[] {
	const types: SearchRecordType[] = [];
	if (isSearchAccount(value)) types.push(SearchRecordType.ACCOUNT);
	if (isSearchAccount(value)) types.push(SearchRecordType.CONTRACT);
	if (isSearchBlock(value)) types.push(SearchRecordType.BLOCK);
	if (isSearchKey(value)) types.push(SearchRecordType.KEY);
	if (isSearchTransaction(value)) types.push(SearchRecordType.TRANSACTION);
	return types;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function isSearchKey(value: string) {
	try {
		PublicKey.from(value);
		return true;
	} catch (e) {
		return false;
	}
}

export function isSearchTransaction(value: string) {
	try {
		Checksum256.from(value);
		return true;
	} catch (e) {
		return false;
	}
}

export function isSearchAccount(value: string) {
	try {
		const name = Name.from(value);
		if (value && String(name) === value) {
			return true;
		}
		return false;
	} catch (e) {
		return false;
	}
}

export function isSearchBlock(value: string) {
	try {
		UInt32.from(value);
		return true;
	} catch (e) {
		return false;
	}
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export class SearchRecordStorage {
	private records = $state<SearchRecord[]>([]) as SearchRecord[];
	chainId: Checksum256;
	maxLength: number;
	storageKey = 'records';

	constructor(network: NetworkState, maxLength = 10) {
		this.chainId = network.chain.id;
		this.maxLength = maxLength;
		if (browser) {
			const item = localStorage.getItem(this.makeStorageKey());
			if (item) this.records = this.deserialize(item);
		}
	}

	private makeStorageKey(): string {
		return `${this.storageKey}-${this.chainId}`;
	}

	private serialize(value: SearchRecord[]): string {
		return JSON.stringify(value);
	}

	private deserialize(item: string): SearchRecord[] {
		return JSON.parse(item);
	}

	private save() {
		if (browser) {
			localStorage.setItem(this.makeStorageKey(), this.serialize(this.records));
		}
	}

	add(s: SearchRecord) {
		const exists = this.records.findIndex((r) => r.url === s.url);
		if (exists >= 0) {
			this.records.splice(exists, 1);
		}
		this.records.unshift(s);
		if (this.records.length > this.maxLength) {
			this.records.splice(this.maxLength);
		}
		this.save();
	}

	remove(i: number) {
		this.records.splice(i, 1);
		this.save();
	}

	get(): SearchRecord[] {
		return this.records;
	}

	clear() {
		this.records = [];
		this.save();
	}
}
