import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: m.common_refund(),
		subtitle: m.common_refund_tokens({
			token: String(network.chain.systemToken?.symbol.name)
		}),
		pageMetaTags: {
			title: m.delegation_metadata_refund_title({
				network: String(network.chain.name)
			}),
			description: m.delegation_metadata_refund_description({
				network: String(network.chain.name)
			})
		}
	};
};
