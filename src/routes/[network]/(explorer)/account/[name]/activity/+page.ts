import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch, params }) => {
	const response = await fetch(`/${params.network}/api/account/${params.name}/activity`);
	const json = await response.json();
	return {
		activity: json.activity
	};
};
