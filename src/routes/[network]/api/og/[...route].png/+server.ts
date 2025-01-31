import { API_OPENGRAPH_GENERATOR } from '$env/static/private';
import type { RequestHandler } from './$types';
import { i18n } from '$lib/i18n';
import { captions } from '$lib/utils/opengraph';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
	const route = params.route as keyof typeof captions;
	const lang = i18n.getLanguageFromUrl(url);
	const text = captions[route] || captions.default;

	const uri = new URL(API_OPENGRAPH_GENERATOR);
	uri.searchParams.set('text', text);
	uri.searchParams.set('lang', lang);

	const response = await fetch(uri.toString());

	return new Response(await response.arrayBuffer(), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400'
		}
	});
};
