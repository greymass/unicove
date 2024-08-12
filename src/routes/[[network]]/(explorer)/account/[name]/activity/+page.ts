import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import { getClient } from '$lib/wharf/client';
import { getActivity } from './activity';

export const load: PageLoad = async ({ fetch, params }: PageLoad) => {
	const client = getClient(fetch, params.network);
	const activity = await getActivity(client, params.name);
	return {
		activity
	};
};
