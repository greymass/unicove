import { json } from '@sveltejs/kit';

import { getCacheHeaders } from '$lib/utils';
import type { RequestEvent } from '../$types';

export async function GET({ locals: { network } }: RequestEvent) {
	if (!network.supports('registry')) {
		return json({
			code: 400,
			message: 'Registry not supported on this network'
		});
	}
	const tokens = await network.contracts.registry.table('tokens').all();
	return json(
		{
			tokens
		},
		{
			headers: getCacheHeaders(300)
		}
	);
}
