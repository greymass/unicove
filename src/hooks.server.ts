import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { isNetworkShortName, ramtoken, systemtoken } from '$lib/wharf/chains';
import { getBackendNetworkByName } from '$lib/wharf/client/ssr';

import * as main from './locales/loader.ssr.svelte';
import * as js from './locales/loader.ssr';
import { runWithLocale, loadLocales } from 'wuchale/load-utils/server';
import { locales } from 'virtual:wuchale/locales';

await loadLocales(main.key, main.loadIDs, main.loadCatalog, locales);
await loadLocales(js.key, js.loadIDs, js.loadCatalog, locales);

export const wuchaleHandle: Handle = async ({ event, resolve }) => {
	let locale: string = 'en';
	const [, firstPart] = event.url.pathname.split('/');
	if (event.cookies.get('locale') !== locale) {
		locale = event.cookies.get('locale') ?? 'en';
	} else if (locales.includes(firstPart)) {
		locale = firstPart;
	}
	event.locals.locale = locale;
	return await runWithLocale(locale, () =>
		resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', locale)
		})
	);
};

type HandleParams = Parameters<Handle>[0];

const renamedNetworks: Record<string, string> = {
	eos: 'vaulta'
};

function isWellKnownFile(pathname: string) {
	return pathname.startsWith('/.well-known/');
}

function isSveltePath(pathname: string) {
	return pathname.startsWith('/_app') || pathname.includes('__data.json');
}

function skipRedirect(pathname: string) {
	return isSveltePath(pathname) || isWellKnownFile(pathname) || pathname.endsWith('.xml');
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

/**
 * Normalizes a URL to always return format: /[lang]/[network]/[more]
 * Handles all permutations and adds defaults where needed
 */
export function normalizeUrl(
	pathname: string,
	options: {
		defaultLang?: string;
		defaultNetwork?: string;
		locale?: string;
	} = {}
): string {
	const { defaultLang = 'en', defaultNetwork = PUBLIC_CHAIN_SHORT, locale } = options;

	if (skipRedirect(pathname)) {
		return pathname;
	}

	const [, pathFirst, pathSecond, ...pathMore] = pathname.split('/').map((p) => p.trim());

	const lang = locale || defaultLang;
	let network = defaultNetwork;
	const remainingPath: string[] = [];

	if (!pathFirst) {
		return `/${lang}/${network}`;
	}

	const isFirstLang = locales.includes(pathFirst);
	const isFirstNetwork = isNetwork(pathFirst) || pathFirst in renamedNetworks;
	const isSecondNetwork = pathSecond && (isNetwork(pathSecond) || pathSecond in renamedNetworks);

	if (isFirstLang && isSecondNetwork) {
		network = renamedNetworks[pathSecond] || pathSecond;
		remainingPath.push(...pathMore);
	} else if (isFirstLang && !isSecondNetwork) {
		if (pathSecond) remainingPath.push(pathSecond);
		remainingPath.push(...pathMore);
	} else if (isFirstNetwork && !pathSecond) {
		network = renamedNetworks[pathFirst] || pathFirst;
	} else if (isFirstNetwork && pathSecond) {
		network = renamedNetworks[pathFirst] || pathFirst;
		remainingPath.push(pathSecond);
		remainingPath.push(...pathMore);
	} else {
		if (pathFirst) remainingPath.push(pathFirst);
		if (pathSecond) remainingPath.push(pathSecond);
		remainingPath.push(...pathMore);
	}

	let url = `/${lang}/${network}`;

	if (remainingPath.length > 0) {
		const remainingPathname = remainingPath.filter(Boolean);
		if (isManualRedirectPath(remainingPathname)) {
			url += getManualRedirectPath(remainingPathname);
		} else {
			url += `/${remainingPathname.join('/')}`;
		}
	}

	return url;
}

export async function networkHandle({ event, resolve }: HandleParams): Promise<Response> {
	event.locals.network = getBackendNetworkByName(PUBLIC_CHAIN_SHORT, event.fetch);
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%network%', event.locals.network.toString())
	});
}

export async function redirectHandle({ event, resolve }: HandleParams): Promise<Response> {
	const { pathname, search } = new URL(event.request.url);

	const url = normalizeUrl(pathname, {
		locale: event.locals.locale
	});

	if (pathname !== url) {
		return new Response(undefined, {
			headers: { Location: url + search },
			status: 302
		});
	}

	return resolve(event);
}

export const handle: Handle = sequence(wuchaleHandle, redirectHandle, networkHandle);
