import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, RequestEvent } from '@sveltejs/kit';

import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { availableLanguageTags } from '$lib/paraglide/runtime.js';
import { i18n } from '$lib/i18n';
import { isNetworkShortName } from '$lib/wharf/chains';
import { getBackendNetworkByName } from '$lib/wharf/client/ssr';

export const i18nHandle = i18n.handle();
type HandleParams = Parameters<Handle>[0];

// TODO: Find a better home for this data
const mappings: Record<string, string> = {
	eos: 'https://unicove.com',
	jungle4: 'https://jungle4.unicove.com',
	kylin: 'https://kylin.unicove.com',
	telos: 'https://telos.unicove.com',
	telostestnet: 'https://telostestnet.unicove.com',
	wax: 'https://wax.unicove.com',
	waxtestnet: 'https://waxtestnet.unicove.com'
};

export function getHeaderLang(event: RequestEvent) {
	const acceptLanguage = event.request.headers.get('accept-language');
	const locales =
		acceptLanguage?.split(',')?.map((lang: string) => lang.split(';')[0].split('-')[0].trim()) ??
		[];
	for (const locale of locales) {
		if (availableLanguageTags.find((l: string) => l.toLowerCase() === locale.toLowerCase())) {
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
	return availableLanguageTags.find((l: string) => l.toLowerCase() === value.toLowerCase());
}

function isNetwork(value: string) {
	return isNetworkShortName(value);
}

function isAlternativeNetwork(value: string) {
	return value !== PUBLIC_CHAIN_SHORT && Object.keys(mappings).includes(value);
}

const redirects: Record<string, string> = {
	'/earn': '/staking',
	'/resources/ram/buy': '/ram/buy',
	'/resources/ram/sell': '/ram/sell'
};

function getManualRedirectPath(pathMore: string[]): string {
	const pathname = '/' + pathMore.join('/');
	return redirects[pathname];
}

function isManualRedirectPath(pathMore: string[]): boolean {
	const pathname = '/' + pathMore.join('/');
	return pathname in redirects;
}

export async function networkHandle({ event, resolve }: HandleParams): Promise<Response> {
	event.locals.network = getBackendNetworkByName(PUBLIC_CHAIN_SHORT, event.fetch);
	return await resolve(event);
}

export async function redirectHandle({ event, resolve }: HandleParams): Promise<Response> {
	const { pathname, search } = new URL(event.request.url);

	if (skipRedirect(pathname)) {
		return await resolve(event);
	}

	const [, pathFirst, pathSecond, ...pathMore] = pathname.split('/').map((p) => p.trim());

	let lang = 'en';
	let network: string = PUBLIC_CHAIN_SHORT;
	let alternativeNetwork: string | undefined;

	if (isLanguage(pathFirst) && isNetwork(pathSecond)) {
		// Proceed, correct URL
		lang = pathFirst;
		network = pathSecond;
	} else if (isLanguage(pathFirst) && !isNetwork(pathSecond) && !pathSecond) {
		// Only a language is specified, land on the language specific homepage
		lang = pathFirst;
	} else if (isLanguage(pathFirst) && isAlternativeNetwork(pathSecond)) {
		// A language is specified, but the network is an alternative - need to redirect
		lang = pathFirst;
		alternativeNetwork = pathSecond;
	} else if (isLanguage(pathFirst) && !isNetwork(pathSecond)) {
		// The network isn't specified, but the language is - redirect to the default network
		lang = pathFirst;
		pathMore.unshift(pathSecond);
	} else if (!isLanguage(pathFirst) && isNetwork(pathFirst)) {
		// The language isn't specified, but the network is - redirect to the default language with the network provided
		network = pathFirst;
		pathMore.unshift(pathSecond);
	} else if (!isLanguage(pathFirst) && isAlternativeNetwork(pathFirst)) {
		// No language, but an alternative network is specified - redirect to the default language with the alternative network
		alternativeNetwork = pathFirst;
	} else {
		// Neither language nor network is specified - redirect to the default language and network
		pathMore.unshift(pathSecond);
		pathMore.unshift(pathFirst);
	}

	// Ensure that the 'lang' property exists on the 'Locals' type
	(event.locals as { lang: string }).lang = lang;

	let url = `/${lang}`;
	if (alternativeNetwork) {
		url += `/${alternativeNetwork}`;
	} else if (network) {
		url += `/${network}`;
	}

	if (pathMore.length > 0) {
		if (isManualRedirectPath(pathMore)) {
			url += getManualRedirectPath(pathMore);
		} else {
			url += `/${pathMore.join('/')}`;
		}
	}

	if (alternativeNetwork) {
		url = mappings[alternativeNetwork] + url;
	}

	if (pathname !== url) {
		return new Response(undefined, {
			headers: { Location: url + search },
			status: 301
		});
	}

	const response = await resolve(event);
	return response;
}

export const handle: Handle = sequence(i18nHandle, redirectHandle, networkHandle);
