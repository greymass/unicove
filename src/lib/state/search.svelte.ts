import { Name, PublicKey, UInt32, Checksum256 } from '@wharfkit/antelope';
import { browser } from '$app/environment';

import type { NetworkState } from './network.svelte';

export type SearchResult = {
	result: string;
	searchType: string;
	searchValue: string;
};

export enum SearchRecordType {
	ACCOUNT = 'account',
	BLOCK = 'block',
	KEY = 'key',
	PAGE = 'page',
	TRANSACTION = 'transaction',
	UNKNOWN = 'unknown'
}

export interface SearchRecord {
	type: SearchRecordType;
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
		value: 'Buy RAM',
		type: SearchRecordType.PAGE,
		keywords: ['ram', 'buy'],
		description: 'Purchase RAM',
		url: '/ram/buy'
	},
	{
		value: 'Sell RAM',
		type: SearchRecordType.PAGE,
		keywords: ['ram', 'sell'],
		description: 'Sell RAM',
		url: '/ram/sell'
	},
	{
		value: 'Send',
		type: SearchRecordType.PAGE,
		keywords: ['send', 'transfer'],
		description: 'Transfer tokens',
		url: '/send'
	},
	{
		value: 'Settings',
		type: SearchRecordType.PAGE,
		keywords: ['settings', 'preferences'],
		description: 'Unicove Settings',
		url: '/settings'
	},
	{
		value: 'Stake',
		type: SearchRecordType.PAGE,
		keywords: ['stake'],
		description: 'Stake tokens',
		url: '/staking/stake'
	},
	{
		value: 'Staking',
		type: SearchRecordType.PAGE,
		keywords: ['staking', 'stake'],
		description: 'Staking overview',
		url: '/staking'
	},
	{
		value: 'RAM Market',
		type: SearchRecordType.PAGE,
		keywords: ['ram'],
		description: 'Market Overview',
		url: '/ram'
	},
	{
		value: 'Resources',
		type: SearchRecordType.PAGE,
		keywords: ['resources', 'cpu', 'net', 'powerup'],
		description: 'Manage CPU/NET',
		url: '/resources'
	},
	{
		value: 'Unstake',
		type: SearchRecordType.PAGE,
		keywords: ['unstake'],
		description: 'Unstake tokens',
		url: '/staking/unstake'
	}
];

export function search(
	query: string,
	network: NetworkState,
	recentHistory: RecordStorage
): SearchRecord[] {
	// Suggestions based on the input
	const suggestions = searchSuggestions(query, network);

	// Search commands for matching keywords
	const commands = searchCommands(query, network);

	// Search recent history
	const recent = searchHistory(query, recentHistory);

	// Combine and return
	return [...commands, ...suggestions, ...recent];
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

export function searchHistory(query: string, recentHistory: RecordStorage): SearchRecord[] {
	const history = recentHistory.get();
	return history
		.filter((r) => r.type !== SearchRecordType.PAGE)
		.filter((r) => r.value.includes(query.trim().toLowerCase()));
}

export class RecordStorage {
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

export function getPossibleSearchTypes(value: string): SearchRecordType[] {
	const types: SearchRecordType[] = [];
	if (isSearchAccount(value)) types.push(SearchRecordType.ACCOUNT);
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
