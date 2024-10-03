import * as m from '$lib/paraglide/messages.js';
import type { LoadEvent } from '@sveltejs/kit';
import type { ABI } from '@wharfkit/antelope';

export const load = async ({ fetch, params, parent }: LoadEvent) => {
	const p = await parent();
	const response = await fetch(`/${params.network}/api/contract/${params.contract}`);
	const json = await response.json();
	const abi: ABI = json.abi.abi;
	return {
		abi,
		contract: params.contract,
		pageMetaTags: {
			title: m.contract_view_title({
				contract: String(params.contract),
				network: p.network.chain.name
			}),
			description: m.contract_view_description({
				contract: String(params.contract),
				network: p.network.chain.name,
				tables: abi.tables.length,
				structs: abi.structs.length,
				actions: abi.actions.length
			})
		}
	};
};
