import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { locale } = await parent();
	await useLocale(locale);
	return {
		creator: params.name,
		title: params.name,
		subtitle: 'Onboarding creator',
		backPath: `/${params.network}/onboarding/creators`
	};
};
