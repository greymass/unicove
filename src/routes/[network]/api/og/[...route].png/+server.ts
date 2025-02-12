import { env } from '$env/dynamic/private';
import { PUBLIC_ENVIRONMENT } from '$env/static/public';
import type { RequestHandler } from './$types';
import { i18n } from '$lib/i18n';
import { getCaption } from '$lib/utils/opengraph';

export const GET: RequestHandler = async ({ locals, url, fetch, params }) => {
	const lang = i18n.getLanguageFromUrl(url);
	const route = params.route;
	const text = getCaption(route, locals.network);
	const cacheAge = PUBLIC_ENVIRONMENT === 'production' ? 86400 : 300;
	let response: Response;

	const API_OPENGRAPH_GENERATOR = env.API_OPENGRAPH_GENERATOR;

	if (API_OPENGRAPH_GENERATOR) {
		const uri = new URL(API_OPENGRAPH_GENERATOR);
		uri.searchParams.set('text', text);
		uri.searchParams.set('lang', lang);
		response = await fetch(uri.toString());
	} else {
		// Uses a local image if no API is provided
		response = await fetch('/opengraph/default.png');
	}

	return new Response(await response.arrayBuffer(), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': `public, max-age=${cacheAge}, stale-while-revalidate=${cacheAge}`
		}
	});
};
