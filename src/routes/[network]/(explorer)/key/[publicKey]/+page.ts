import type { Load } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

export const load: Load = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const accountsPromise = fetch(`/${params.network}/api/key/${params.publicKey}`)
		.then((response) => response.json())
		.then((json) => json.accounts || []);

	const title = m.key_page_title();
	const description = m.key_page_description();

	return {
		title,
		subtitle: `${params.publicKey?.slice(0, 10)}...${params.publicKey?.slice(-10)}`,
		publicKey: params.publicKey,
		accounts: accountsPromise,
		network: params.network,
		pageMetaTags: {
			title: `${title} | ${network.chain.name} Network`,
			description
		}
	};
};
