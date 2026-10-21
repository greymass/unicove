import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { network }, params, url }) => {
	const actionType = url.searchParams.get('action_type') || 'all';
	const offset = Number(url.searchParams.get('offset')) || 0;
	const limit = Number(url.searchParams.get('limit')) || 20;

	const baseResponse = {
		actionType,
		offset,
		limit,
		subtitle: `Multisig Activity for ${params.name}`,
		pageMetaTags: {
			title: `Multisig Activity for ${params.name}`,
			description: `Complete multisig activity timeline for ${params.name}`
		}
	};

	if (!network.supports('msigapi')) {
		return {
			...baseResponse,
			activity: [],
			total: 0,
			more: false
		};
	}

	try {
		const response = await network.msigs.get_activity(params.name, {
			action_type: actionType === 'all' ? undefined : actionType,
			limit,
			offset
		});

		return {
			...baseResponse,
			activity: response.activity,
			total: response.total,
			more: response.more
		};
	} catch (error) {
		console.error('Error loading activity:', error);
		return {
			...baseResponse,
			activity: [],
			total: 0,
			more: false,
			error: String(error)
		};
	}
};
