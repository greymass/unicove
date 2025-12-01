import { useLocale } from '$lib/utils/intl';
import type { LayoutLoad } from './$types';
import { ProducersState } from '$lib/state/producers.svelte';

export const load: LayoutLoad = async ({ parent }) => {
	const { network, locale } = await parent();
	await useLocale(locale);

	const producersState = new ProducersState(network);

	try {
		await producersState.loadProducers();
	} catch (e) {
		console.error('Error loading producers:', e);
	}

	return {
		producersState
	};
};
