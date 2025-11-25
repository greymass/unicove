import { getBlocks } from '$lib/remote/blocks.remote';
import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	const blocks = await getBlocks();

	return {
		title: `Explore ${network.chain.name}`,
		subtitle: `Explore blockchain resources`,
		blocks
	};
};
