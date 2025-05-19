import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, RequestEvent } from '@sveltejs/kit';

import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { locales } from '$lib/paraglide/runtime.js';

import { isNetworkShortName, ramtoken, systemtoken } from '$lib/wharf/chains';
import { getBackendNetworkByName } from '$lib/wharf/client/ssr';
import { paraglideMiddleware } from '$lib/paraglide/server';

type HandleParams = Parameters<Handle>[0];

const renamedNetworks: Record<string, string> = {
	eos: 'vaulta'
};

export function getHeaderLang(event: RequestEvent) {
	const acceptLanguage = event.request.headers.get('accept-language');
	const acceptedLocales =
		acceptLanguage?.split(',')?.map((lang: string) => lang.split(';')[0].split('-')[0].trim()) ??
		[];
	for (const locale of acceptedLocales) {
		if (locales.find((l: string) => l.toLowerCase() === locale.toLowerCase())) {
			return locale;
		}
	}
	return null;
}

function isAPIPath(pathname: string) {
	return /^\/[a-z0-9]+\/api/gm.test(pathname);
}

function isSvelteKitData(pathname: string) {
	// if it contains __data.json, it is a sveltekit data request
	return pathname.includes('__data.json');
}

function isWellKnownPath(pathname: string) {
	return /\.well-known/gm.test(pathname);
}

function skipRedirect(pathname: string) {
	return isSvelteKitData(pathname) || isWellKnownPath(pathname) || isAPIPath(pathname);
}

function isNetwork(value: string) {
	return isNetworkShortName(value);
}

const redirects: Record<string, string> = {
	'/earn': '/staking',
	'/resources/ram/buy': '/ram/buy',
	'/resources/ram/sell': '/ram/sell',
	'/swap/eos': `/swap/${systemtoken.id.url}/core.vaulta/4,a`,
	'/swap/kb': `/swap/${systemtoken.id.url}/${ramtoken.id.url}}`,
	'/swap/ram': `/swap/${systemtoken.id.url}/${ramtoken.id.url}}`,
	'/swap/eosio/4,eos/core.vaulta/4,a': '/swap/eosio.token/4,eos/core.vaulta/4,a'
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

	console.log('redirectHandle', event.request.url);

	const [, pathFirst, pathSecond, ...pathMore] = pathname.split('/').map((p) => p.trim());

	let lang = pathFirst;
	const network: string = PUBLIC_CHAIN_SHORT;

	if (!isNetwork(pathSecond) && !renamedNetworks[pathSecond]) {
		lang = pathFirst;
		pathMore.unshift(pathSecond);
	}

	// Ensure that the 'lang' property exists on the 'Locals' type
	(event.locals as { lang: string }).lang = lang;

	let url = `/${lang}/${network}`;

	if (pathMore.length > 0) {
		if (isManualRedirectPath(pathMore)) {
			url += getManualRedirectPath(pathMore);
		} else {
			url += `/${pathMore.join('/')}`;
		}
	}

	if (pathname !== url) {
		console.log('Redirecting from', pathname, 'to', url);
		return new Response(undefined, {
			headers: { Location: url + search },
			status: 302
		});
	}

	const response = await resolve(event);
	return response;
}

const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		// console.log('paraglideHandle', event.request.url, locale);
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%lang%', locale);
			}
		});
	});

export const handle: Handle = sequence(redirectHandle, paraglideHandle, networkHandle);
