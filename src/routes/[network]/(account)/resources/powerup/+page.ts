import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { getLocale } from '$lib/paraglide/runtime';

export const load: PageLoad = async ({ parent }) => {
	const { network } = await parent();
	return {
		title: m.resources_rent_title(),
		subtitle: m.resources_rent_subtitle({ network: network.chain.name }),
		backPath: `/${getLocale()}/${network}/resources`,
		pageMetaTags: {
			title: m.resources_rent_metadata_title({ network: network.chain.name }),
			description: m.resources_rent_metadata_description({ network: network.chain.name })
		}
	};
};
