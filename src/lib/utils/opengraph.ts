import { OpengraphImageData } from '$lib/types/opengraph';
import { Serializer } from '@wharfkit/antelope';

/**
 * Creates the canonical url for the opengraph image of the specified route.
 * Accessing this url generates an image based on the predefined options found at the api endpoint.
 */
export function ogImageURL(url: URL, { title, text }: { title: string; text: string }) {
	const [lang, network] = url.pathname.split('/').filter(Boolean);

	const data = OpengraphImageData.from({ title, text });

	const bytes = Serializer.encode({ object: data });

	const pathname = `${lang}/${network}/api/og/${bytes.toString()}.png`;

	const uri = new URL(pathname, url.origin);

	return uri.toString();
}
