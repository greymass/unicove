import { error } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';
import { PublicKey } from '@wharfkit/antelope';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	const accounts = await fetch(`/${params.network}/api/key/${params.publicKey}`)
		.then((response) => response.json())
		.then((json) => json.accounts || []);

	const title = m.key_page_title();
	const description = m.key_page_description();

	let pubkey: PublicKey;

	try {
		pubkey = PublicKey.from(String(params.publicKey));
	} catch (e) {
		error(404, {
			message: 'Key not found',
			code: 'KEY_NOT_FOUND'
		});
	}

	return {
		title,
		publicKey: pubkey,
		accounts,
		network: params.network,
		pageMetaTags: {
			title: `${title} | ${network.chain.name} Network`,
			description
		}
	};
};
