import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

import { PUBLIC_CHAIN_SHORT } from '$env/static/public';
import { getBackendNetworkByName } from '$lib/wharf/client/ssr';

import * as main from './locales/loader.ssr.svelte';
import * as js from './locales/loader.ssr';
import { runWithLocale, loadLocales } from 'wuchale/load-utils/server';
import { locales } from 'virtual:wuchale/locales';
import { localizePath } from '$lib/utils/url';

await loadLocales(main.key, main.loadIDs, main.loadCatalog, locales);
await loadLocales(js.key, js.loadIDs, js.loadCatalog, locales);

export const wuchaleHandle: Handle = async ({ event, resolve }) => {
	let locale: string = 'en';
	const [, firstPart] = event.url.pathname.split('/');
	if (event.cookies.get('locale') !== locale) {
		locale = event.cookies.get('locale') ?? locale;
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

export async function networkHandle({ event, resolve }: HandleParams): Promise<Response> {
	event.locals.network = getBackendNetworkByName(PUBLIC_CHAIN_SHORT, event.fetch);
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%network%', event.locals.network.toString())
	});
}

export async function redirectHandle({ event, resolve }: HandleParams): Promise<Response> {
	const { pathname, search } = new URL(event.request.url);

	const url = localizePath(pathname, {
		forceNetwork: PUBLIC_CHAIN_SHORT,
		forceLocale: event.locals.locale
	});

	if (pathname !== url && !pathname.includes('/api/')) {
		return new Response(undefined, {
			headers: { Location: url + search },
			status: 302
		});
	}

	return resolve(event);
}

export const handle: Handle = sequence(wuchaleHandle, redirectHandle, networkHandle);
