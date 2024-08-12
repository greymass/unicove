import { error } from '@sveltejs/kit';
import { APIClient, FetchProvider, type API } from '@wharfkit/antelope';
import { RoborovskiClient } from '@wharfkit/roborovski';

import type { PageLoad } from './$types';
import type { Activity } from './types';

import { getClient } from '$lib/wharf/client';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async ({ fetch, params }: PageLoad) => {
	// Attempt to load the block from the API
	const client = getClient(fetch);
	const robo = new RoborovskiClient(client);
	let response: API.v1.GetActionsResponse;
	try {
		response = await robo.get_actions(params.name, {
			limit: 10,
			start: 1,
			reverse: true
		});
	} catch (e) {
		return error(500, {
			message: `Error while loading activity for ${params.name}.`
		});
	}

	const activity: Activity = {
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
	};

	return {
		activity
	};
};
