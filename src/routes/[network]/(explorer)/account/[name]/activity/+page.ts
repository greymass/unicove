import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, fetch, url }) => {
	const { network } = await parent();

	const account = params.name;
	const startIndex = url.searchParams.get('start') || 0;

	// console.log('startIndex', startIndex);
	// console.log(`/${network}/api/account/${account}/activity/${startIndex}`);

	const response = await fetch(`/${network}/api/account/${account}/activity/${-startIndex}`);
	const json = await response.json();

	return {
		json,
		subtitle: `Recent activity on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `Account Activity for ${params.name} | ${network.chain.name} Network`,
			description: `View the transaction history of the ${params.name} account on the ${network.chain.name} network.`
		}
	};
};
