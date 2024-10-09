import { json, type RequestEvent } from '@sveltejs/kit';

import { getChainDefinitionFromParams } from '$lib/state/network.svelte';
import { getCacheHeaders } from '$lib/utils';
import type { ChainShortName } from '$lib/wharf/chains.js';
import { tokens } from './tokens';

export async function GET({ params }: RequestEvent) {
	const chain = getChainDefinitionFromParams(String(params.network));
	if (!chain) {
		return json({ error: 'Invalid chain specified' }, { status: 400 });
	}
	return json(
		{
			ts: new Date(),
			tokens: tokens[params.network as ChainShortName]
		},
		{
			headers: getCacheHeaders(300) // 60 min cache
		}
	);
}
