import { env } from '$env/dynamic/private';
import { PUBLIC_ENVIRONMENT } from '$env/static/public';
import type { RequestHandler } from './$types';
import { i18n } from '$lib/i18n';
import { ogImageData } from './data';

export const GET: RequestHandler = async ({ locals, url, fetch, params }) => {
	const lang = i18n.getLanguageFromUrl(url);
	const route = params.route;
	const { text, title, layout } = ogImageData(route, locals.network);
	const cacheAge = PUBLIC_ENVIRONMENT === 'production' ? 86400 : 300;
	let response: Response;

	const API_OPENGRAPH_GENERATOR = env.API_OPENGRAPH_GENERATOR;
	const API_OPENGRAPH_TOKEN = env.API_OPENGRAPH_TOKEN;

	if (!API_OPENGRAPH_GENERATOR || !API_OPENGRAPH_TOKEN) {
		response = await fetch('/opengraph/default.png'); // default local image
	} else {
		const uri = new URL(API_OPENGRAPH_GENERATOR);
		uri.searchParams.set('text', text);
		if (title) uri.searchParams.set('title', title);
		if (layout) uri.searchParams.set('layout', String(layout));
		uri.searchParams.set('lang', lang);
		response = await fetch(uri.toString(), {
			headers: {
				Authorization: `Bearer ${API_OPENGRAPH_TOKEN}`
			}
		});
	}

	return new Response(await response.arrayBuffer(), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': `public, max-age=${cacheAge}, stale-while-revalidate=${cacheAge}`
		}
	});
};
