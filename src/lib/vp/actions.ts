import type { VpMsigStatus, VpSummary } from './types';

export interface VpSentimentTopicAction {
	kind: 'sentiment-topic';
	contract: string;
	topic: string;
}

export interface VpSentimentMsigAction {
	kind: 'sentiment-msig';
	proposer: string;
	proposal: string;
}

export interface VpMsigLinkAction {
	kind: 'msig-link';
	proposer: string;
	proposal: string;
	status: VpMsigStatus;
	msigPath: string;
	live: boolean;
}

export type VpActionModel = VpSentimentTopicAction | VpSentimentMsigAction | VpMsigLinkAction;

export function vpActionModels(summary: VpSummary): VpActionModel[] {
	const models: VpActionModel[] = [];
	for (const ref of summary.sentiment) {
		models.push({ kind: 'sentiment-topic', contract: ref.contract, topic: ref.topic });
	}
	for (const msig of summary.msigs) {
		if (msig.status === 'active') {
			models.push({
				kind: 'sentiment-msig',
				proposer: msig.proposer,
				proposal: msig.proposal
			});
		}
		models.push({
			kind: 'msig-link',
			proposer: msig.proposer,
			proposal: msig.proposal,
			status: msig.status,
			msigPath: `/msig/${msig.proposer}/${msig.proposal}`,
			live: msig.status === 'active'
		});
	}
	return models;
}

export function vpActionKey(model: VpActionModel): string {
	switch (model.kind) {
		case 'sentiment-topic':
			return `topic:${model.topic}`;
		case 'sentiment-msig':
			return `msigvote:${model.proposer}/${model.proposal}`;
		case 'msig-link':
			return `msiglink:${model.proposer}/${model.proposal}`;
	}
}
