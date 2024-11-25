import { browser } from '$app/environment';
import type { Checksum256 } from '@wharfkit/antelope';
import type { NetworkState } from './network.svelte';

export type SearchResult = {
	result: string;
	searchType: string;
	searchValue: string;
};

export enum RecordType {
	ACCOUNT = 'account',
	BLOCK = 'block',
	KEY = 'key',
	PAGE = 'page',
	TRANSACTION = 'transaction',
	UNKNOWN = 'unknown'
}

export interface Record {
	type: RecordType;
	value: string;
	keywords?: string[];
	description?: string;
	url: string;
}

// TODO: Potential new interfaces for different types of records
// export interface Command extends Record {}
// export interface Favorite extends Record {}

export const SearchCommands: Record[] = [
	{
		value: 'Buy RAM',
		type: RecordType.PAGE,
		keywords: ['ram', 'buy'],
		description: 'Purchase RAM',
		url: '/ram/buy'
	},
	{
		value: 'Sell RAM',
		type: RecordType.PAGE,
		keywords: ['ram', 'sell'],
		description: 'Sell RAM',
		url: '/ram/sell'
	},
	{
		value: 'Send',
		type: RecordType.PAGE,
		keywords: ['send', 'transfer'],
		description: 'Transfer tokens',
		url: '/send'
	},
	{
		value: 'Settings',
		type: RecordType.PAGE,
		keywords: ['settings', 'preferences'],
		description: 'Unicove Settings',
		url: '/settings'
	},
	{
		value: 'Stake',
		type: RecordType.PAGE,
		keywords: ['stake'],
		description: 'Stake tokens',
		url: '/staking/stake'
	},
	{
		value: 'Staking',
		type: RecordType.PAGE,
		keywords: ['staking', 'stake'],
		description: 'Staking overview',
		url: '/staking'
	},
	{
		value: 'RAM Market',
		type: RecordType.PAGE,
		keywords: ['ram'],
		description: 'Market Overview',
		url: '/ram'
	},
	{
		value: 'Resources',
		type: RecordType.PAGE,
		keywords: ['resources', 'cpu', 'net', 'powerup'],
		description: 'Manage CPU/NET',
		url: '/resources'
	},
	{
		value: 'Unstake',
		type: RecordType.PAGE,
		keywords: ['unstake'],
		description: 'Unstake tokens',
		url: '/staking/unstake'
	}
];

export function search(
	query: string,
	network: NetworkState,
	recentHistory: RecordStorage
): Record[] {
	// Search commands for matching keywords
	const commands = SearchCommands.filter((c) =>
		c.keywords?.some((keyword) => keyword.toLowerCase().includes(query.trim().toLowerCase()))
	).map((c) => ({
		...c,
		url: `/${network}${c.url}`
	}));

	// Search recent history
	const history = recentHistory.get();
	const recent = history
		.filter((r) => r.type !== RecordType.PAGE)
		.filter((r) => r.value.includes(query.trim().toLowerCase()));

	// Combine and return
	return [...commands, ...recent];
}

export class RecordStorage {
	private records = $state<Record[]>([]) as Record[];
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

	private serialize(value: Record[]): string {
		return JSON.stringify(value);
	}

	private deserialize(item: string): Record[] {
		return JSON.parse(item);
	}

	private save() {
		if (browser) {
			localStorage.setItem(this.makeStorageKey(), this.serialize(this.records));
		}
	}

	add(s: Record) {
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

	get(): Record[] {
		return this.records;
	}

	clear() {
		this.records = [];
		this.save();
	}
}
