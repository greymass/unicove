import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
	// Redirect to the root proposals page, preserving query params
	const queryString = url.search;
	throw redirect(307, `/account/${params.name}/proposals${queryString}`);
};
