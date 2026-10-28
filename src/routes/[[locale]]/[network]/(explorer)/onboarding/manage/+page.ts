import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { locale } = await parent();
	await useLocale(locale);
	return {
		title: 'Manage onboarding',
		subtitle: 'Network-funded onboarding',
		backPath: `/${params.network}/onboarding`
	};
};
