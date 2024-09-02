import { error } from '@sveltejs/kit';
import type { ABI } from '@wharfkit/antelope';

import * as m from '$lib/paraglide/messages.js';
import { parseRicardian } from '$lib/utils';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const p = await parent();
	const action = p.abi.actions.find((s: ABI.Action) => s.name === params.action);
	if (!action) {
		error(404);
	}
	const actionData = p.abi.structs.find((s: ABI.Struct) => s.name === action.type);
	const ricardian = parseRicardian(action);
	return {
		action,
		actionData,
		data: params.data,
		pageMetaTags: {
			title: [
				m.contract_action_view_title({
					action: params.action
				}),
				p.pageMetaTags.title
			].join(' | '),
			description: m.contract_action_view_description({
				action: params.action,
				contract: p.contract,
				network: p.network.chain.name
			})
		},
		ricardian
	};
};
