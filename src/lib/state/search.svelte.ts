import { browser } from '$app/environment';

type SearchResult = {
	result: string;
	searchType: string;
	searchValue: string;
};

const maxHistoryLength = 10;

export class SearchHistory {
	history = $state<SearchResult[]>([]) as SearchResult[];
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
		if (history.length > maxHistoryLength) {
			this.history.splice(maxHistoryLength);
		}
		this.saveHistory();
	}

	// remove() {}

	get(): SearchResult[] {
		return this.history;
	}

	clear() {
		this.history = [];
		this.saveHistory();
	}
}
