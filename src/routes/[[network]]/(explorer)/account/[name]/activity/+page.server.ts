import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';
import { getActivity } from './activity';
import { getBackendClient } from '$lib/wharf/client/ssr';

export const load: PageLoad = async ({ fetch, params }: PageLoad) => {
	const client = getBackendClient(fetch, params.network);
	const activity = await getActivity(client, params.name);
	return {
		activity
	};
};
