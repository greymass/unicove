import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { network }, params, url }) => {
	const status = url.searchParams.get('status') || 'all';
	const offset = Number(url.searchParams.get('offset')) || 0;
	const limit = Number(url.searchParams.get('limit')) || 20;

	const baseResponse = {
		status,
		offset,
		limit,
		subtitle: `Multisig Proposals Pending Approval from ${params.name}`,
		pageMetaTags: {
			title: `Multisig Proposals Pending Approval from ${params.name}`,
			description: `Multisig proposals awaiting approval from ${params.name}`
		}
	};

	if (!network.supports('msigapi')) {
		return {
			...baseResponse,
			proposals: [],
			total: 0,
			more: false
		};
	}

	try {
		const response = await network.msigs.get_approver_proposals(params.name, {
			status: status === 'all' ? undefined : status,
			include_approved: true,
			limit,
			offset
		});

		return {
			...baseResponse,
			proposals: response.proposals,
			total: response.total,
			more: response.more
		};
	} catch (error) {
		console.error('Error loading pending proposals:', error);
		return {
			...baseResponse,
			proposals: [],
			total: 0,
			more: false,
			error: String(error)
		};
	}
};
