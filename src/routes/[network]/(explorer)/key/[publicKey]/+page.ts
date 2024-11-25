import type { Load } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';
import { PublicKey } from '@wharfkit/antelope';

export const load: Load = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const accountsPromise = fetch(`/${params.network}/api/key/${params.publicKey}`)
		.then((response) => response.json())
		.then((json) => json.accounts || []);

	const title = m.key_page_title();
	const description = m.key_page_description();
	const pubkey = PublicKey.from(String(params.publicKey));

	return {
		title,
		subtitle: `${params.publicKey?.slice(0, 10)}...${params.publicKey?.slice(-10)}`,
		publicKey: pubkey,
		accounts: accountsPromise,
		network: params.network,
		pageMetaTags: {
			title: `${title} | ${network.chain.name} Network`,
			description
		}
	};
};
