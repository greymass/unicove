import { AccountState } from '$lib/state/client/account.svelte';
import { error } from '@sveltejs/kit';
import { Name } from '@wharfkit/antelope';
import { getNetworkByName } from '$lib/state/network.svelte';
import type { LayoutLoad } from './$types';
import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { Code } from '@lucide/svelte';
import { localizePath } from '$lib/utils/url';

export const load: LayoutLoad = async ({ fetch, params }) => {
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
		actions.push({
			icon: Code,
			href: localizePath(`/contract/${params.name}`, { defaultLocale: params.locale })
		});
	}

	return {
		account,
		name: params.name,
		title: `${params.name}`,
		header: {
			copyData: params.name,
			actions: actions
		}
	};
};
