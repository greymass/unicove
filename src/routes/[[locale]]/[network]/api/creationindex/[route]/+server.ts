import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCacheHeaders } from '$lib/utils';
import { isCreationindexRoute } from '$lib/state/creationindex/client';

export const GET: RequestHandler = async ({ fetch, locals: { network }, params, url }) => {
	const base = network.config.endpoints.creationindex;
	if (!network.supports('creationindex') || !base) {
		error(503, 'Account creation service not configured for this network');
	}

	if (!isCreationindexRoute(params.route)) {
		error(404, 'Unknown account creation route');
	}

	const apiUrl = new URL(`${base}/v1/creationindex/${params.route}`);
	url.searchParams.forEach((value, key) => {
		apiUrl.searchParams.set(key, value);
	});

	let response: Response;
	try {
		response = await fetch(apiUrl.toString());
	} catch {
		error(502, 'Unable to reach the account creation service');
	}

	const headers: Record<string, string> = {
		'content-type': response.headers.get('content-type') ?? 'application/json'
	};
	if (response.ok) {
		Object.assign(headers, getCacheHeaders(10));
	}

	return new Response(await response.text(), { status: response.status, headers });
};
