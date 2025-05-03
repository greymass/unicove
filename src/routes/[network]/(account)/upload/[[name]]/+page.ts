import type { PageLoad } from './$types';
// import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ params }) => {
	return {
		name: params.name,
		title: 'Upload Smart Contract',
		subtitle: 'Upload a smart contract by selecting the ABI and WASM files from your computer.',
		pageMetaTags: {
			title: 'Upload Smart Contract',
			description: 'Upload a smart contract by selecting the ABI and WASM files from your computer.'
		}
	};
};
