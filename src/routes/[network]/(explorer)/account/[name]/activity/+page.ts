import type { LoadEvent } from '@sveltejs/kit';
import { ActivityAction } from '$lib/types';

interface LoadData {
	activityActions: ActivityAction[];
}

export async function load({ fetch, params }: LoadEvent): Promise<LoadData> {
	let activityActions: ActivityAction[] = [];
	try {
		const response = await fetch(`/${params.network}/api/account/${params.name}/activity`);
		const json: { activity: { actions: string[] } } = await response.json();
		activityActions = json.activity.actions.map((item) => ActivityAction.from(item));
	} catch (error: unknown) {
		console.error('Error fetching activity actions:', error);
	}

	return { activityActions };
}
