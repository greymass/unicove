import type { VpSummary } from './types';

export interface VpSentimentTopicAction {
	kind: 'sentiment-topic';
	contract: string;
	topic: string;
}

export interface VpSentimentMsigAction {
	kind: 'sentiment-msig';
	proposer: string;
	proposal: string;
	msigPath: string;
}

export type VpActionModel = VpSentimentTopicAction | VpSentimentMsigAction;

export function vpActionModels(summary: VpSummary): VpActionModel[] {
	const models: VpActionModel[] = [];
	for (const ref of summary.sentiment) {
		models.push({ kind: 'sentiment-topic', contract: ref.contract, topic: ref.topic });
	}
	for (const msig of summary.msigs) {
		if (msig.status !== 'active') {
			continue;
		}
		models.push({
			kind: 'sentiment-msig',
			proposer: msig.proposer,
			proposal: msig.proposal,
			msigPath: `/msig/${msig.proposer}/${msig.proposal}`
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
	}
}
