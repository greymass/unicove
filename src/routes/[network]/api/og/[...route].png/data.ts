import * as m from '$lib/paraglide/messages';
import type { NetworkState } from '$lib/state/network.svelte';

export type OpengraphImageOption = {
	text: string;
	title?: string;
	layout?: number;
};

/**
 * A map of valid route names to their opengraph image options.
 * 1) Prevents users from generating custom opengraph images.
 * 2) Allows passing more values to the generator api.
 *
 * Since the opengraph image needs to be accessible from a static url we need an intermediate step
 * to include the options required to generate that image (e.g. text, title, layout, etc.) and
 * the security token in the header of the api request.
 */
export function ogImageData(route: string, network: NetworkState): OpengraphImageOption {
	switch (route) {
		case 'send':
			return {
				text: m.og_send_caption(),
				title: m.common_send_tokens({
					token: ''
				}),
				layout: 1
			};
		default:
			return {
				text: m.og_default_caption({
					network: network.chain.name
				})
			};
	}
}
