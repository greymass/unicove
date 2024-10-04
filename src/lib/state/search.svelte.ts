type SearchResult = {
	result: string;
	searchType: string;
};

export const history = $state<SearchResult[]>([]);

export function addHistory(s: SearchResult) {
	history.unshift(s);
}
