import { APIClient, API, Serializer } from '@wharfkit/antelope';
import { RoborovskiClient } from '@wharfkit/roborovski';
import type { Activity } from './types';

export async function getActivity(client: APIClient, name: string): Promise<Activity> {
	const robo = new RoborovskiClient(client);
	let response: API.v1.GetActionsResponse;
	try {
		response = await robo.get_actions(name, {
			limit: 10,
			start: 1,
			reverse: true
		});
	} catch {
		throw new Error(`Error while loading activity for ${name}.`);
	}

	return Serializer.objectify({
		actions: response.actions.map((action) => {
			return {
				id: action.action_trace.trx_id,
				timestamp: action.block_time,
				contract: action.action_trace.act.account,
				action: action.action_trace.act.name,
				authorizations: action.action_trace.act.authorization,
				data: action.action_trace.act.data,
				raw: action
			};
		}),
		first: response.actions[0].account_action_seq,
		last: response.actions[response.actions.length - 1].account_action_seq,
		head_block_num: response.actions[0].block_num
	});
}
