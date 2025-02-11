import { json, type RequestEvent } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';

export async function GET({ locals: { network } }: RequestEvent) {
	return json(
		{
			ts: new Date(),
			tokens: network.config.tokens
		},
		{
			headers: getCacheHeaders(3600)
		}
	);
}
