import { API, APIClient } from '@wharfkit/antelope';
import { RoborovskiClient } from '@wharfkit/roborovski';
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
		console.log(response);
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
