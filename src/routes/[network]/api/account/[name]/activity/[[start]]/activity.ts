import {
	APIClient,
	API,
	Serializer,
	Int32,
	Name,
	type Int32Type,
	type NameType
} from '@wharfkit/antelope';
import type { Activity } from '$lib/types';

interface GetActionOptions {
	start?: Int32Type;
	limit?: Int32Type;
	reverse?: boolean;
}

interface GetActionParams {
	account_name: NameType;
	pos?: Int32Type;
	offset?: Int32Type;
}

async function get_actions(client: APIClient, accountName: NameType, options?: GetActionOptions) {
	let reverse = options?.reverse;

	const params: GetActionParams = {
		account_name: Name.from(accountName)
	};

	if (options) {
		if (options.start !== undefined) {
			params['pos'] = Int32.from(options.start);
		}
		if (options.limit) {
			params['offset'] = Int32.from(options.limit);
		}
		if (options.reverse && params['pos']) {
			params['pos'] *= -1;
		}
		if (options.reverse && params['offset']) {
			params['offset'] *= -1;
		}
	} else {
		// Default to most recent 100 actions reversed
		params['pos'] = Int32.from(-1);
		params['offset'] = Int32.from(-100);
		reverse = true;
	}

	const result = await client.call({
		path: '/v1/history/get_actions',
		params,
		responseType: API.v1.GetActionsResponse
	});

	if (reverse) {
		result.actions.reverse();
	}

	return result;
}

// async get_transaction(
//     id: Checksum256Type,
//     options: {blockNumHint?: UInt32Type; traces?: boolean} = {}
// ) {
//     return this.client.call({
//         path: '/v1/history/get_transaction',
//         params: {
//             id: Checksum256.from(id),
//             block_num_hint: options.blockNumHint && UInt32.from(options.blockNumHint),
//             traces: options.traces !== undefined ? options.traces : false,
//         },
//         responseType: API.v1.GetTransactionResponse,
//     })
// }

export async function getActivity(
	client: APIClient,
	name: string,
	start: number
): Promise<Activity> {
	// const robo = new RoborovskiClient(client);
	// let response: API.v1.GetActionsResponse;
	// try {
	// const response = await robo.get_actions(name, {
	// 	limit: 20,
	// 	start: start,
	// 	reverse: true
	// });
	// } catch (e) {
	// 	throw new Error(`Error while loading activity for ${name}.`);
	// }
	const response = await get_actions(client, name, {
		limit: 20,
		start: start,
		reverse: true
	});

	return Serializer.objectify({
		actions: response.actions.map((action) => {
			return {
				id: action.action_trace.trx_id,
				seq: action.global_action_seq,
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
