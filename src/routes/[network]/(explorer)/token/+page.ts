import { TokensState } from '$lib/state/tokens.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	const tokens = new TokensState(network);
	console.log(tokens);
	return {
		tokens,
		title: `Token Directory`,
		subtitle: ``,
		pageMetaTags: {
			title: `Token Directory`,
			description: ``
		}
	};
};
