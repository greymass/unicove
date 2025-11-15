import { json } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';
import { getProducersRecursive } from '../utils';
import type { RequestEvent } from './$types';

export async function GET({ locals: { network } }: RequestEvent) {
	const all = await getProducersRecursive(network);
	const producers = all
		.sort((a, b) => Number(b.total_votes) - Number(a.total_votes))
		.slice(0, 30)
		.map((p) => p.owner);

	const headers = getCacheHeaders(600);

	return json(
		{
			ts: new Date(),
			producers
		},
		{
			headers
		}
	);
}
