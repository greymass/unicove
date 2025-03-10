import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
	const { contract, network } = await parent();
	const response = await fetch(
		`/${network}/api/contract/${params.contract}/table/${params.table}/${params.scope || params.contract}?${url.searchParams}`
	);
	const json = await response.json();
	return {
		pageMetaTags: {
			title: m.contract_tables_view_title({
				table: params.table
			}),
			description: m.contract_tables_view_description({
				contract: String(contract),
				network: network.chain.name,
				table: params.table
			})
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
