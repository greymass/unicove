import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, RequestEvent } from '@sveltejs/kit';

import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { availableLanguageTags } from '$lib/paraglide/runtime.js';
import { i18n } from '$lib/i18n';
import { isNetworkShortName, ramtoken, systemtoken } from '$lib/wharf/chains';
import { getBackendNetworkByName } from '$lib/wharf/client/ssr';

export const i18nHandle = i18n.handle();
type HandleParams = Parameters<Handle>[0];

const renamedNetworks: Record<string, string> = {
	eos: 'vaulta'
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
	return isAPIPath(pathname) || pathname.endsWith('.xml');
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
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%network%', event.locals.network.toString())
	});
}

export async function redirectHandle({ event, resolve }: HandleParams): Promise<Response> {
	const { pathname, search } = new URL(event.request.url);

	if (skipRedirect(pathname)) {
		return resolve(event);
	}

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
		return new Response(undefined, {
			headers: { Location: url + search },
			status: 302
		});
	}

	return resolve(event);
}

export const handle: Handle = sequence(i18nHandle, redirectHandle, networkHandle);
