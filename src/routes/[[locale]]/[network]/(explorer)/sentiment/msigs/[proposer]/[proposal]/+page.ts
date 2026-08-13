import { useLocale } from '$lib/utils/intl';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { MsigSentimentState } from '$lib/state/sentiment/msig.svelte';

export const load: PageLoad = async ({ parent, params }) => {
	const { network, locale } = await parent();

	await useLocale(locale);

	const sentiment = new MsigSentimentState(network, locale);

	try {
		await Promise.all([
			sentiment.loadMsig(params.proposer, params.proposal),
			sentiment.loadMsigVotes(params.proposer, params.proposal)
		]);
	} catch (e) {
		console.error('Error loading msig sentiment:', e);
		throw error(500, 'Failed to load msig sentiment data');
	}

	if (!sentiment.currentMsig) {
		throw error(404, {
			message: 'Msig proposal not found',
			code: 'NOT_FOUND',
			title: `${params.proposer}/${params.proposal}`,
			subtitle: 'Multisig Proposal'
		});
	}

	return {
		sentiment,
		proposer: params.proposer,
		proposal: params.proposal,
		backPath: `/${locale}/${params.network}/msig/${params.proposer}/${params.proposal}`,
		title: `${params.proposer}/${params.proposal}`,
		subtitle: 'Community sentiment on this multisig proposal',
		pageMetaTags: {
			title: [`${params.proposer}/${params.proposal}`, 'Sentiment', network.chain.name].join(' | '),
			description: [
				'Overview and statistics for community sentiment on the',
				`${params.proposer}/${params.proposal}`,
				'multisig proposal'
			].join(' ')
		}
	};
};
