import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const response = await fetch(`/${params.network}/api/msig/${params.name}`);
	const json = await response.json();

	if ('error' in json) {
		error(404, json.error);
	}

	return {
		proposals: json.proposals,
		subtitle: `Multisig proposals by ${params.name} on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `Multisig Proposals | ${params.name} | ${network.chain.name} Network`,
			description: `Multisig proposals by ${params.name} on the ${network.chain.name} Network.`
		}
	};
};
