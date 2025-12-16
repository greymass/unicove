import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
	const status = url.searchParams.get('status') || 'proposed';
	const offset = Number(url.searchParams.get('offset')) || 0;
	const limit = Number(url.searchParams.get('limit')) || 20;

	try {
		// Parallelize parent() and msigs fetch for faster loading
		const parentPromise = parent();
		const proposalsPromise = parentPromise.then(({ network }) =>
			network.msigs.get_proposals(params.name, {
				status: status === 'all' ? undefined : status,
				limit,
				offset
			})
		);

		const [parentData, response] = await Promise.all([parentPromise, proposalsPromise]);

		return {
			...parentData,
			proposals: response.proposals,
			total: response.total,
			more: response.more,
			status,
			offset,
			limit,
			subtitle: `Proposals Created by ${params.name}`,
			pageMetaTags: {
				title: `Proposals Created by ${params.name}`,
				description: `View all multisig proposals created by ${params.name}`
			}
		};
	} catch (error) {
		console.error('Error loading created proposals:', error);
		return {
			proposals: [],
			total: 0,
			more: false,
			error: String(error),
			status,
			offset,
			limit
		};
	}
};
