import type { LayoutServerLoad } from './$types';
import { fetchVpIndex } from '$lib/vp/fetch';
import { vpForMsig } from '$lib/vp/onchain';

export const load: LayoutServerLoad = async ({ fetch, params }) => {
	try {
		const index = await fetchVpIndex(fetch);
		const summary = vpForMsig(index, params.proposer, params.proposal);
		if (!summary) {
			return { vp: null };
		}
		return { vp: { vp: summary.vp, title: summary.title, slug: summary.slug } };
	} catch {
		return { vp: null };
	}
};
