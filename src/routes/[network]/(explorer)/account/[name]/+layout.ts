import { AccountState } from '$lib/state/client/account.svelte';
import { error, type LoadEvent } from '@sveltejs/kit';
import { Name } from '@wharfkit/antelope';

export const load = async ({ fetch, params, parent }: LoadEvent) => {
	const { network } = await parent();
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
	return {
		account,
		name: account.name,
		title: `${account.name}`,
		subtitle: `Account overview on the ${network.chain.name} Network`,
		pageMetaTags: {
			title: `${account.name} | ${network.chain.name} Network Account`,
			description: `An overview of the ${account.name} account on the ${network.chain.name} Network. View account assets, activity, resources and more.`
		}
	};
};
