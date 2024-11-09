import { ActivityAction } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
	const { network } = await parent();
	let activityActions: ActivityAction[] = [];
	try {
		const response = await fetch(`/${params.network}/api/account/${params.name}/activity`);
		const json: { activity: { actions: string[] } } = await response.json();
		activityActions = json.activity.actions.map((item) => ActivityAction.from(item));
	} catch (error: unknown) {
		console.error('Error fetching activity actions:', error);
	}

	return {
		activityActions,
		subtitle: `Recent activity on the ${network.chain.name} Network.`,
		pageMetaTags: {
			title: `Account Activity for ${params.name} | ${network.chain.name} Network`,
			description: `View the transaction history of the ${params.name} account on the ${network.chain.name} network.`
		}
	};
};
