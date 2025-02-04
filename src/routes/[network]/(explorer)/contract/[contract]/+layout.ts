import * as m from '$lib/paraglide/messages.js';
import { Name, type ABI } from '@wharfkit/antelope';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/${params.network}/api/contract/${params.contract}`);
	const json = await response.json();
	const abi: ABI = json.abi.abi;

	return {
		abi,
		contract: Name.from(params.contract),

		title: params.contract,
		subtitle: 'Contract',

		pageMetaTags: {
			title: m.contract_view_title({
				contract: String(params.contract),
				network: network.chain.name
			}),
			description: m.contract_view_description({
				contract: String(params.contract),
				network: network.chain.name,
				tables: abi.tables.length,
				structs: abi.structs.length,
				actions: abi.actions.length
			})
		}
	};
};
