/**
 * Creates the canonical url for the opengraph image of the specified route.
 * Accessing this url generates an image based on the predefined options found at the api endpoint.
 */
export function ogImageUrl(url: URL) {
	const [lang, network, ...rest] = url.pathname.split('/').filter(Boolean);
	const filename = rest.length ? rest.join('/') : 'default';
	return `${url.origin}/${lang}/${network}/api/og/${filename}.png`;
}
