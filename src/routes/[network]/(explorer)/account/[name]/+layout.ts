import { AccountState } from '$lib/state/client/account.svelte';
import { error } from '@sveltejs/kit';
import { Name } from '@wharfkit/antelope';
import * as m from '$lib/paraglide/messages';
import { getNetworkByName } from '$lib/state/network.svelte';
import type { LayoutLoad } from './$types';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';

export const load: LayoutLoad = async ({ fetch, params }) => {
	const network = await getNetworkByName(PUBLIC_CHAIN_SHORT, fetch);
	if (!network.loaded) {
		await network.refresh();
	}
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
		name: params.name,
		title: `${params.name}`,
		subtitle: m.account_page_subtitle({
			network: network.chain.name
		}),
		pageMetaTags: {
			title: m.account_meta_title({
				account: String(params.name),
				network: network.chain.name
			}),
			description: m.account_meta_description({
				account: String(params.name),
				network: network.chain.name
			})
		}
	};
};
