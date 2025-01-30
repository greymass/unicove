import { error, type LoadEvent } from '@sveltejs/kit';
import type { ABI } from '@wharfkit/antelope';

import * as m from '$lib/paraglide/messages.js';
import { parseRicardian } from '$lib/utils';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }: LoadEvent) => {
	const p = await parent();
	const action = p.abi.actions.find((s: ABI.Action) => s.name === params.action);
	if (!action) {
		error(404);
	}
	const struct = p.abi.structs.find((s: ABI.Struct) => s.name === action.type);
	const ricardian = parseRicardian(action);
	return {
		action,
		struct,
		data: params.data,
		pageMetaTags: {
			title: [
				m.contract_action_view_title({
					action: String(params.action)
				}),
				p.pageMetaTags.title
			].join(' | '),
			description: m.contract_action_view_description({
				action: String(params.action),
				contract: String(p.contract),
				network: p.network.chain.name
			})
		},
		ricardian
	};
};
