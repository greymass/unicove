import { Name, type ABI } from '@wharfkit/antelope';
import { error } from '@sveltejs/kit';

import type { LayoutLoad } from './$types';
import { User } from '@lucide/svelte';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/en/${network}/api/contract/${params.contract}`);
	const json = await response.json();

	if (!response.ok || !json.abi.abi) {
		return error(404, {
			message: `No contract is currently deployed to the ${params.contract} account.`,
			code: 'NOT_FOUND'
		});
	}
	const abi: ABI = json.abi.abi;

	return {
		abi,
		contract: Name.from(params.contract),

		title: params.contract,
		subtitle: 'Contract',
		header: {
			copyData: String(params.contract),
			actions: [{ icon: User, href: `/${network}/account/${params.contract}` }]
		},
		pageMetaTags: {
			title: `Contract: ${params.contract} | ${network.chain.name}`,
			description: `An overview of the ${params.contract} smart contract on the ${network.chain.name} network. This contract contains ${abi.actions.length} actions, ${abi.tables.length} tables, and ${abi.structs.length} structs.`
		}
	};
};
