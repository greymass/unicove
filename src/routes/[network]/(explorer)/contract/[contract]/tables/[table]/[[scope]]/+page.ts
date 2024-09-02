import { Serializer } from '@wharfkit/antelope';
import { ContractKit } from '@wharfkit/contract';

import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async ({ params, parent }) => {
	const p = await parent();
	const kit = new ContractKit({ client: p.network.client });
	const contract = await kit.load(params.contract);
	const rows = await contract.table(params.table, params.scope).first(100).next();
	return {
		pageMetaTags: {
			title: m.contract_tables_view_title({
				table: params.table
			}),
			description: m.contract_tables_view_description({
				contract: p.contract,
				network: p.network.chain.name,
				table: params.table
			})
		},
		rows: Serializer.objectify(rows),
		table: params.table
	};
};
