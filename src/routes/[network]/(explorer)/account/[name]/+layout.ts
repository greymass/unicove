import { AccountState } from '$lib/state/client/account.svelte';
import { error } from '@sveltejs/kit';
import { Name } from '@wharfkit/antelope';
import * as m from '$lib/paraglide/messages';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	let account: AccountState;
	try {
		account = await AccountState.for(network, Name.from(String(params.name)), fetch);
	} catch (e) {
		console.error(e);
		error(404, {
			message: m.account_404({
				account: String(params.name)
			}),
			code: 'NOT_FOUND'
		});
	}
	return {
		account,
		name: account.name,
		title: `${account.name}`,
		subtitle: m.account_page_subtitle({
			network: network.chain.name
		}),
		pageMetaTags: {
			title: m.account_meta_title({
				account: String(account.name),
				network: network.chain.name
			}),
			description: m.account_meta_description({
				account: String(account.name),
				network: network.chain.name
			})
		}
	};
};
