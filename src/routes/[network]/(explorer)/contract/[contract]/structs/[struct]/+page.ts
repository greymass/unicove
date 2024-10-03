import type { PageLoad } from './$types';
import * as m from '../../../../../../../lib/paraglide/messages.js';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, parent }) => {
	const p = await parent();
	if (!p.abi.structs.find((s) => s.name === params.struct)) {
		error(404);
	}
	return {
		pageMetaTags: {
			title: [m.contract_struct_view_title({ struct: params.struct }), p.pageMetaTags.title].join(
				' | '
			),
			description: m.contract_struct_view_description({
				struct: params.struct,
				contract: String(p.contract),
				network: p.network.chain.name
			})
		},
		struct: params.struct
	};
};
