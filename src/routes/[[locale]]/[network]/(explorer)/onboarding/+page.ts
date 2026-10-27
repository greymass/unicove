import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	return {
		title: 'Network-funded onboarding',
		subtitle: network.chain.name,
		backPath: `/${params.network}/governance`
	};
};
