import { error } from '@sveltejs/kit';

import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { network, locale } = await parent();
	if (!network.supports('finality')) {
		error(404, 'Not found');
	}
	await useLocale(locale);
	return {
		title: 'Finality',
		subtitle: network.chain.name,
		backPath: `/${params.network}/network`
	};
};
