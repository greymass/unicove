import type { LayoutLoad } from './$types';
import * as m from '$lib/paraglide/messages';

export const load: LayoutLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: m.common_send_tokens(),
		subtitle: m.common_transfer_to_another_account(),
		pageMetaTags: {
			title: m.common_send_tokens(),
			description: m.send_page_description({
				network: network.chain.name
			})
		}
	};
};
