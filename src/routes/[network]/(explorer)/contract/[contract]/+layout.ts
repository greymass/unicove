import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import type { ABI } from '@wharfkit/antelope';

export const load: PageLoad = async ({ fetch, params, parent }: Pageload) => {
	const p = await parent();
	const response = await fetch(`/${params.network}/api/contract/${params.contract}`);
	const json = await response.json();
	const abi: ABI = json.abi.abi;
	return {
		abi,
		contract: params.contract,
		pageMetaTags: {
			title: `Contract: ${params.contract} | ${p.network.chain.name}`,
			description: `An overview of the ${params.contract} smart contract on the ${p.network.chain.name} network. This contract contains ${abi.actions.length} actions, ${abi.tables.length} tables, and ${abi.structs.length} structs.`
		}
	};
};
