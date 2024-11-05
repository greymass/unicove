import { browser } from '$app/environment';

type SearchResult = {
	result: string;
	searchType: string;
	searchValue: string;
};

export class SearchHistory {
	private history = $state<SearchResult[]>([]) as SearchResult[];
	maxHistoryLength = 10;
	storageKey = 'searchHistory';

	constructor() {
		if (browser) {
			const item = localStorage.getItem(this.storageKey);
			if (item) this.history = this.deserialize(item);
		}
	}

	private serialize(value: SearchResult[]): string {
		return JSON.stringify(value);
	}

	private deserialize(item: string): SearchResult[] {
		return JSON.parse(item);
	}

	private saveHistory() {
		if (browser) {
			localStorage.setItem(this.storageKey, this.serialize(this.history));
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
