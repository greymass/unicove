import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { network } = await parent();

	const ramResponse: Promise<Response> = fetch(`/${network}/api/metrics/marketprice/ram`);
	const tokenResponse: Promise<Response> = fetch(`/${network}/api/metrics/marketprice/token`);

	return {
		ramResponse,
		tokenResponse
	};
};
