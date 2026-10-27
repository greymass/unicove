import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { locale } = await parent();
	await useLocale(locale);
	return {
		creator: params.creator,
		title: params.creator,
		subtitle: 'Account origins',
		backPath: `/${params.network}/network/origins`
	};
};
