import * as m from '$lib/paraglide/messages';
import type { NetworkState } from '$lib/state/network.svelte';

/**
 * Creates the api url to generate an opengraph image for the specified route.
 * Defaults to the generic caption.
 */
export function ogImage(url: URL) {
	const [lang, network, ...rest] = url.pathname.split('/').filter(Boolean);
	const filename = rest.length ? rest.join('/') : 'default';
	return `${url.origin}/${lang}/${network}/api/og/${filename}.png`;
}

/**
 * A map of valid route names to their captions. Prevents users from generating invalid opengraph images.
 */
export function getCaption(route: string, network: NetworkState) {
	switch (route) {
		case 'send':
			return m.og_send_caption();
		default:
			return m.og_default_caption({
				network: network.chain.name
			});
	}
}
