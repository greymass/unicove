import { AccountState } from '$lib/state/client/account.svelte';
import { error } from '@sveltejs/kit';
import { Name } from '@wharfkit/antelope';
import { getNetworkByName } from '$lib/state/network.svelte';
import type { LayoutLoad } from './$types';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { Code } from '@lucide/svelte';
import { ogImageURL } from '$lib/utils/opengraph';

export const load: LayoutLoad = async ({ fetch, url, params }) => {
	const network = getNetworkByName(PUBLIC_CHAIN_SHORT, fetch);
	if (!network.loaded) {
		await network.refresh();
	}
	let account: AccountState;
	try {
		account = await AccountState.for(network, Name.from(String(params.name)), fetch);
	} catch (e) {
		console.error(e);
		error(404, {
			message: `Account not found: ${String(params.name)}`,
			code: 'NOT_FOUND'
		});
	}

	const actions = [];

	if (account.contract) {
		actions.push({ icon: Code, href: `/${network}/contract/${params.name}` });
	}

	const metaTitle = `${String(params.name)} | ${network.chain.name} Network Account`;
	const metaDescription = `An overview of the ${String(params.name)} account on the ${network.chain.name} Network. View account assets, activity, resources and more.`;

	return {
		account,
		name: params.name,
		title: `${params.name}`,
		subtitle: `Account overview on the ${network.chain.name} Network`,
		header: {
			copyData: params.name,
			actions: actions
		},
		pageMetaTags: {
			title: metaTitle,
			description: metaDescription,
			open_graph_image: ogImageURL(url, {
				title: params.name,
				text: metaTitle
			})
		}
	};
};
