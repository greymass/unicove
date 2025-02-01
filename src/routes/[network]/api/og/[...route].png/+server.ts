import { API_OPENGRAPH_GENERATOR } from '$env/static/private';
import { PUBLIC_ENVIRONMENT } from '$env/static/public';
import type { RequestHandler } from './$types';
import { i18n } from '$lib/i18n';
import { getCaption } from '$lib/utils/opengraph';
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
	const lang = i18n.getLanguageFromUrl(url);
	const route = params.route;
	const text = getCaption(route);

	// Uses a local image if no API is provided
	if (!API_OPENGRAPH_GENERATOR) {
		const imagePath = path.resolve('static', 'opengraph', 'default.png');
		const image = fs.readFileSync(imagePath);
		return new Response(image, {
			headers: {
				'Content-Type': 'image/png'
			}
		});
	}

	const uri = new URL(API_OPENGRAPH_GENERATOR);
	uri.searchParams.set('text', text);
	uri.searchParams.set('lang', lang);

	const response = await fetch(uri.toString());

	const cacheAge = PUBLIC_ENVIRONMENT === 'production' ? 86400 : 300;

	return new Response(await response.arrayBuffer(), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': `public, max-age=${cacheAge}, stale-while-revalidate=${cacheAge}`
		}
	});
};
