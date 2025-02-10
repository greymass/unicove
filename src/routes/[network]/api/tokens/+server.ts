import { json, type RequestEvent } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';
import { getChainConfigByName } from '$lib/wharf/chains.js';

export async function GET({ params }: RequestEvent) {
	const chain = getChainConfigByName(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}
	return json(
		{
			ts: new Date(),
			tokens: chain.tokens
		},
		{
			headers: getCacheHeaders(3600)
		}
	);
}
