import { error } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';
import { PublicKey } from '@wharfkit/antelope';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
	let pubkey: PublicKey;

	try {
		pubkey = PublicKey.from(String(params.publicKey));
	} catch (e) {
		error(404, {
			message: `Key not found: ${e}`,
			code: 'KEY_NOT_FOUND'
		});
	}

	const { network } = await parent();
	const accounts = await fetch(`/${params.network}/api/key/${params.publicKey}`)
		.then((response) => response.json())
		.then((json) => json.accounts || []);

	const title = m.key_page_title();
	const description = m.key_page_description({
		accounts: accounts.length,
		network: network.chain.name
	});
	const subtitle = m.key_page_subtitle({ accounts: accounts.length });

	return {
		title,
		subtitle,
		publicKey: pubkey,
		accounts,
		network: params.network,
		pageMetaTags: {
			title: `${pubkey} | ${network.chain.name} Network`,
			description
		}
	};
};
