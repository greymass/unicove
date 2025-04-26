import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, RequestEvent } from '@sveltejs/kit';

import { PUBLIC_CHAIN_SHORT, PUBLIC_ENVIRONMENT } from '$env/static/public';
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
	telostestnet: 'https://testnet.telos.unicove.com',
	vaulta: 'https://unicove.com',
	wax: 'https://wax.unicove.com',
	waxtestnet: 'https://testnet.wax.unicove.com'
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

function isNetwork(value: string) {
	return isNetworkShortName(value);
}

function isAlternativeNetwork(value: string) {
	return value !== PUBLIC_CHAIN_SHORT && Object.keys(mappings).includes(value);
}

const redirects: Record<string, string> = {
	'/earn': '/staking',
	'/resources/ram/buy': '/ram/buy',
	'/resources/ram/sell': '/ram/sell',
	'/swap/vaulta': '/swap/eosio.token/4,eos/core.vaulta/4,xyz'
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
	return await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%network%', event.locals.network.toString())
	});
}

export async function redirectHandle({ event, resolve }: HandleParams): Promise<Response> {
	const { pathname, search } = new URL(event.request.url);

	if (skipRedirect(pathname)) {
		return await resolve(event);
	}

	const [, pathFirst, pathSecond, ...pathMore] = pathname.split('/').map((p) => p.trim());

	let lang = pathFirst;
	let network: string = PUBLIC_CHAIN_SHORT;
	let alternativeNetwork: string | undefined;

	if (PUBLIC_ENVIRONMENT === 'production' && isAlternativeNetwork(pathSecond)) {
		alternativeNetwork = pathSecond;
	}

	if (!isNetwork(pathSecond) && !isAlternativeNetwork(pathSecond)) {
		lang = pathFirst;
		network = PUBLIC_CHAIN_SHORT;
		pathMore.unshift(pathSecond);
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
