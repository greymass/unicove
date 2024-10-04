type SearchResult = {
	result: string;
	searchType: string;
};

const maxHistoryLength = 10;

export const history = $state<SearchResult[]>([]);

export function addHistory(s: SearchResult) {
	history.unshift(s);
	if (history.length > maxHistoryLength) {
		history.splice(maxHistoryLength);
	}
}
