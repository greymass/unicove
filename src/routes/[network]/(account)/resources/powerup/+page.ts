import { languageTag } from '$lib/paraglide/runtime';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { network } = await parent();
	return {
		title: 'Rent Resources',
		subtitle: `Rent CPU and NET resources on the ${network.chain.name} network.`,
		backPath: `/${languageTag()}/${params.network}/resources`,
		pageMetaTags: {
			title: `Rent Resources | ${network.chain.name} Network`,
			description: `Rent CPU and NET resources on the ${network.chain.name} network using an ${network.chain.name} compatible wallet.`
		}
	};
};
