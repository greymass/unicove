import { browser } from '$app/environment';
import type { Checksum256 } from '@wharfkit/antelope';
import type { NetworkState } from './network.svelte';

export type SearchResult = {
	result: string;
	searchType: string;
	searchValue: string;
};

export class SearchHistory {
	private history = $state<SearchResult[]>([]) as SearchResult[];
	chainId: Checksum256;
	maxHistoryLength = 10;
	storageKey = 'searchHistory';

	constructor(network: NetworkState) {
		this.chainId = network.chain.id;
		if (browser) {
			const item = localStorage.getItem(this.makeStorageKey());
			if (item) this.history = this.deserialize(item);
		}
	}

	private makeStorageKey(): string {
		return `${this.storageKey}-${this.chainId}`;
	}

	private serialize(value: SearchResult[]): string {
		return JSON.stringify(value);
	}

	private deserialize(item: string): SearchResult[] {
		return JSON.parse(item);
	}

	private saveHistory() {
		if (browser) {
			localStorage.setItem(this.makeStorageKey(), this.serialize(this.history));
		}
	}

	add(s: SearchResult) {
		this.history.unshift(s);
		if (history.length > this.maxHistoryLength) {
			this.history.splice(this.maxHistoryLength);
		}
		this.saveHistory();
	}

	remove(i: number) {
		this.history.splice(i, 1);
		this.saveHistory();
	}

	get(): SearchResult[] {
		return this.history;
	}

	clear() {
		this.history = [];
		this.saveHistory();
	}
}
