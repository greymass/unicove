import { getCacheHeaders } from '$lib/utils';
import { TokenDataSources, TokenDefinition, TokenPair } from '$lib/types/token';
import { Serializer } from '@wharfkit/session';
import type { RequestEvent } from './$types';
import { json } from '@sveltejs/kit';

export async function GET({ fetch, locals: { network }, params }: RequestEvent) {
	let basePair: TokenDefinition;
	try {
		basePair = Serializer.decode({ data: params.base, type: TokenDefinition });
	} catch (error) {
		return json({ error: String(error) }, { status: 400 });
	}
	const response = await fetch(`/${network}/api/pairs`);
	if (!response.ok) {
		return json({ error: 'Failed to fetch pairs' }, { status: 500 });
	}
	const data = await response.json();
	return json(
		TokenDataSources.from({
			ts: new Date(),
			pairs: data.pairs.filter((pair: TokenPair) =>
				TokenDefinition.from(pair.base).equals(basePair)
			)
		}),
		{
			headers: getCacheHeaders(300)
		}
	);
}
