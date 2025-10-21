import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
	const { contract, network } = await parent();
	const response = await fetch(
		`/en/${network}/api/contract/${params.contract}/table/${params.table}/${params.scope || params.contract}?${url.searchParams}`
	);
	const json = await response.json();
	return {
		pageMetaTags: {
			title: `Table: ${params.table}`,
			description: `The ${params.table} data table in the ${contract} smart contract on the ${network.chain.name} network.`
		},
		rows: json.rows,
		next: json.next,
		table: params.table,
		scope: params.scope,
		lower: url.searchParams.get('lower'),
		upper: url.searchParams.get('upper'),
		reverse: url.searchParams.get('reverse') === 'true'
	};
};
