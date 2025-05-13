import { API, APIClient } from '@wharfkit/antelope';
import { RoborovskiClient } from '@wharfkit/roborovski';
import { HyperionAPIClient, Types } from '@wharfkit/hyperion';
import { ActivityResponse } from '$lib/types/transaction';

export async function getActivity(
	client: APIClient,
	name: string,
	start: number
): Promise<ActivityResponse> {
	const robo = new RoborovskiClient(client);
	let response: API.v1.GetActionsResponse;
	try {
		response = await robo.get_actions(name, {
			limit: 20,
			start: start,
			reverse: true
		});
	} catch {
		throw new Error(`Error while loading activity for ${name}.`);
	}
	return ActivityResponse.from({
		actions: response.actions,
		first: response.actions[0].account_action_seq,
		last: response.actions[response.actions.length - 1].account_action_seq,
		head_block_num: response.actions[0].block_num
	});
}

export interface ActivityFilter {
	account?: string;
	action?: string;
}

export async function getFilteredActivity(
	client: APIClient,
	name: string,
	start: number,
	filter: ActivityFilter
): Promise<ActivityResponse> {
	const hyperion = new HyperionAPIClient(client);
	let response: Types.v2.GetActionsResponse;
	try {
		response = await hyperion.v2.history.get_actions(name, {
			limit: 20
			// global_sequence: String(start),
			// reverse: true
		});
		console.log('Response:', response);
	} catch (e) {
		throw new Error(`Error while loading activity for ${name}: ${e}`);
	}
	return ActivityResponse.fromHyperion(name, response);
}
