import { useLocale } from '$lib/utils/intl';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);
	return {
		title: `Get started on the ${network.chain.name} Network`,
		subtitle: `Select a wallet and create an account on the ${network.chain.name} network.`,
		pageMetaTags: {
			title: `Get started on the ${network.chain.name} Network`,
			description: `Select a ${network.chain.name} compatible wallet and create an account on the ${network.chain.name} network.`
		}
	};
};
