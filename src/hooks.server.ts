import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, RequestEvent } from '@sveltejs/kit';

import { availableLanguageTags } from '$lib/paraglide/runtime.js';
import { i18n } from '$lib/i18n';
import { isNetworkShortName } from '$lib/wharf/chains';

export const i18nHandle = i18n.handle();
type HandleParams = Parameters<Handle>[0];

export function getHeaderLang(event: RequestEvent) {
	const acceptLanguage = event.request.headers.get('accept-language');
	const locales =
		acceptLanguage?.split(',')?.map((lang: string) => lang.split(';')[0].split('-')[0].trim()) ??
		[];
	for (const locale of locales) {
		if (availableLanguageTags.find((l: string) => l.toLowerCase() === locale)) {
			return locale;
		}
	}
	return null;
}

function isAPIPath(pathname: string) {
	return /^\/[a-z0-9]+\/api/gm.test(pathname);
}

function skipRedirect(pathname: string) {
	return isAPIPath(pathname);
}

function isLanguage(value: string) {
	return availableLanguageTags.find((l: string) => l.toLowerCase() === value);
}

function isNetwork(value: string) {
	return isNetworkShortName(value);
}

export async function redirectHandle({ event, resolve }: HandleParams): Promise<Response> {
	const { pathname, search } = new URL(event.request.url);

	if (skipRedirect(pathname)) {
		return await resolve(event);
	}

	// Store the original path segments
	const originalPathSegments = pathname.split('/').filter(Boolean);

	// Identify if this is a public key route and get the key if it exists
	const keyIndex = originalPathSegments.findIndex((segment) => segment.toLowerCase() === 'key');
	const originalPublicKey =
		keyIndex !== -1 && keyIndex + 1 < originalPathSegments.length
			? originalPathSegments[keyIndex + 1]
			: null;

	const [, pathFirst, pathSecond, ...pathMore] = pathname
		.split('/')
		.map((p) => p.trim().toLowerCase());

	let lang = 'en';
	let network: string | undefined = 'eos';

	if (isLanguage(pathFirst) && isNetwork(pathSecond)) {
		// Proceed, correct URL
		lang = pathFirst;
		network = pathSecond;
	} else if (isLanguage(pathFirst) && !isNetwork(pathSecond) && !pathSecond) {
		// Only a language is specified, land on the language specific homepage
		lang = pathFirst;
		network = undefined;
	} else if (isLanguage(pathFirst) && !isNetwork(pathSecond)) {
		// The network isn't specified, but the language is - redirect to the default network
		lang = pathFirst;
		pathMore.unshift(pathSecond);
	} else if (!isLanguage(pathFirst) && isNetwork(pathFirst)) {
		// The language isn't specified, but the network is - redirect to the default language with the network provided
		network = pathFirst;
		pathMore.unshift(pathSecond);
	} else {
		// Neither language nor network is specified - redirect to the default language and network
		pathMore.unshift(pathSecond);
		pathMore.unshift(pathFirst);
	}

	// Ensure that the 'lang' property exists on the 'Locals' type
	(event.locals as { lang: string }).lang = lang;

	// Build the URL
	let url = `/${lang}`;
	if (network) {
		url += `/${network}`;
	}

	// Reconstruct the remaining path, preserving public key case if it exists
	if (pathMore.length > 0) {
		const remainingPath = pathMore.map((segment, i) => {
			if (segment.toLowerCase() === 'key') {
				return 'key';
			}
			// If this is the segment after 'key', use the original case
			if (i > 0 && pathMore[i - 1].toLowerCase() === 'key' && originalPublicKey) {
				return originalPublicKey;
			}
			return segment;
		});
		url += `/${remainingPath.join('/')}`;
	}

	// Set the original case public key in params if it exists
	if (originalPublicKey) {
		event.params.publicKey = originalPublicKey;
	}

	if (pathname.toLowerCase() !== url.toLowerCase()) {
		return new Response(undefined, {
			headers: { Location: url + search },
			status: 301
		});
	}

	const response = await resolve(event);
	return response;
}

export const handle: Handle = sequence(i18nHandle, redirectHandle);
