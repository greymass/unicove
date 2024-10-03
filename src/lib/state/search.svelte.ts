type SearchResult = {
	result: string;
	searchType: string;
};

export const history = $state<SearchResult[]>([]);
