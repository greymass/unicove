import { error } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';
import { PublicKey } from '@wharfkit/antelope';
import type { PageLoad } from './$types';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';

export const load: PageLoad = async ({ fetch, params, parent }) => {
	let pubkey: PublicKey;

	try {
		pubkey = PublicKey.from(String(params.publicKey));
	} catch (e) {
		error(404, {
			message: m.key_404({ error: String(e) }),
			code: 'KEY_NOT_FOUND'
		});
	}

	const { network } = await parent();
	const accounts = await fetch(`/en/${PUBLIC_CHAIN_SHORT}/api/key/${params.publicKey}`)
		.then((response) => response.json())
		.then((json) => json.accounts || []);

	// TODO: The title should follow the rest of the sections of the explorer and be the public key.
	// The pageheader component should be in charge of visually truncating the text but the full text should
	// still be in the DOM for a11y and SEO
	const title = m.key_page_title();
	const description = m.key_page_description({
		accounts: accounts.length,
		network: network.chain.name
	});
	const subtitle = m.key_page_subtitle({ accounts: accounts.length });

	return {
		title,
		subtitle,
		header: {
			copyData: pubkey
		},
		publicKey: pubkey,
		accounts,
		network: PUBLIC_CHAIN_SHORT,
		pageMetaTags: {
			title: `${pubkey} | ${network.chain.name} Network`,
			description
		}
	};
};
