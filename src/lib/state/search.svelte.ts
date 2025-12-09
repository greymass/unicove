import { Name, PublicKey, UInt32, Checksum256 } from '@wharfkit/antelope';
import { browser } from '$app/environment';
import type { NetworkState } from './network.svelte';
import type { UnicoveContext } from './client.svelte';
import type { Proposal } from '@wharfkit/msigs';

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
	// View a multisig proposal
	MSIG = 'msig',
	// Visit a page
	PAGE = 'page',
	// Switch to an account
	SWITCH = 'switch',
	// View a topic
	TOPIC = 'topics',
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

const SearchCommands: SearchRecord[] = [
	{
		value: 'RAM Market',
		type: SearchRecordType.PAGE,
		keywords: ['ram'],
		description: 'Market Overview',
		url: '/ram'
	},
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
		description: 'Configure Unicove',
		url: '/settings'
	},
	{
		value: 'Staking',
		type: SearchRecordType.PAGE,
		keywords: ['staking', 'stake'],
		description: 'Staking overview',
		url: '/staking'
	},
	{
		value: 'Stake',
		type: SearchRecordType.PAGE,
		keywords: ['stake'],
		description: 'Stake Tokens',
		url: '/staking/stake'
	},
	{
		value: 'Unstake',
		type: SearchRecordType.PAGE,
		keywords: ['unstake'],
		description: 'Unstake tokens',
		url: '/staking/unstake'
	},
	{
		value: 'Resources',
		type: SearchRecordType.PAGE,
		keywords: ['resources', 'cpu', 'net', 'powerup'],
		description: 'Manage CPU/NET',
		url: '/resources'
	},
	{
		value: 'Clear',
		type: SearchRecordType.CLEAR,
		description: 'Clear search history',
		keywords: ['clear', 'history'],
		url: ''
	}
];

export async function search(context: UnicoveContext, query: string): Promise<SearchRecord[]> {
	const results: SearchRecord[] = [];

	// Listing of the currently logged in accounts for quick switching
	if (context.settings.data.searchAccountSwitch) {
		results.push(...searchAccounts(query, context));
	}

	// Page suggestions based on the input
	if (context.settings.data.searchShowPages) {
		results.push(...searchCommands(query, context));
	}

	// Search commands for matching keywords
	results.push(...searchSuggestions(query, context));

	// Search recent history
	results.push(...searchHistory(query, context.history));

	// Search msigs
	results.push(...(await searchMsigs(query, context)));

	return results;
}

export function searchAccounts(query: string, context: UnicoveContext): SearchRecord[] {
	const { network, wharf, urlPath } = context;
	return wharf.sessions
		.filter((s) => network.chain.id.equals(s.chain))
		.filter((s) => String(s.actor).includes(query.trim().toLowerCase()))
		.map((s) => ({
			data: s,
			description: 'Switch Account',
			type: SearchRecordType.SWITCH,
			value: `${s.actor}@${s.permission}`,
			url: urlPath(`/${network}/account/${s.actor}`)
		}));
}

export function searchSuggestions(query: string, context: UnicoveContext): SearchRecord[] {
	const { network, urlPath } = context;
	return getPossibleSearchTypes(query, context).map((type) => {
		const result: SearchRecord = {
			type,
			value: query,
			url: urlPath(`/${network}/${type}/${query}`)
		};

		// Add custom descriptions for types that need different display text
		if (type === SearchRecordType.TOPIC) {
			result.description = 'View topic';
		}

		return result;
	});
}

export function searchCommands(query: string, context: UnicoveContext): SearchRecord[] {
	const { network, urlPath } = context;
	return SearchCommands.filter((c) =>
		c.keywords?.some((keyword) => keyword.toLowerCase().includes(query.trim().toLowerCase()))
	).map((c) => ({
		...c,
		url: urlPath(`/${network}${c.url}`)
	}));
}

export function searchHistory(query: string, recentHistory: SearchRecordStorage): SearchRecord[] {
	const history = recentHistory.get();
	return history
		.filter((r) => r.type !== SearchRecordType.PAGE)
		.filter((r) => r.value.includes(query.trim().toLowerCase()));
}

export async function searchMsigs(query: string, context: UnicoveContext): Promise<SearchRecord[]> {
	const { network, urlPath } = context;
	try {
		const response = await network.msigs.search_proposals(query, { limit: 10 });
		return response.proposals.map((proposal: Proposal) => ({
			type: SearchRecordType.MSIG,
			value: `${proposal.proposer}:${proposal.proposal_name}`,
			url: urlPath(`/${network}/msig/${proposal.proposer}/${proposal.proposal_name}`)
		}));
	} catch (error) {
		console.error('Error searching msigs:', error);
		return [];
	}
}

export function getPossibleSearchTypes(value: string, context: UnicoveContext): SearchRecordType[] {
	const types: SearchRecordType[] = [];
	if (isSearchAccount(value)) types.push(SearchRecordType.ACCOUNT);
	if (isSearchAccount(value)) types.push(SearchRecordType.CONTRACT);
	if (isSearchBlock(value)) types.push(SearchRecordType.BLOCK);
	if (isSearchKey(value)) types.push(SearchRecordType.KEY);
	if (isSearchTransaction(value)) types.push(SearchRecordType.TRANSACTION);
	// Only add topic search if sentiment feature is enabled
	if (context.network.config.features.sentiment && isSearchAccount(value)) {
		types.push(SearchRecordType.TOPIC);
	}
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
