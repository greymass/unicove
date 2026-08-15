import { vpMsigSteps } from './onchain';
import type { VpMsigStatus, VpSummary } from './types';

export interface VpProposalTopicRow {
	kind: 'proposal';
	contract: string;
	topic: string;
	topicPath: string;
	votable: true;
}

export interface VpMsigPollRow {
	kind: 'msig';
	step: number;
	title: string | null;
	proposer: string;
	proposal: string;
	msigPath: string;
	status: VpMsigStatus;
	votable: boolean;
	supersededAttempts: number;
}

export type VpSentimentRowModel = VpProposalTopicRow | VpMsigPollRow;

export function vpProposalTopicRows(summary: VpSummary): VpProposalTopicRow[] {
	return summary.sentiment.map((ref) => ({
		kind: 'proposal',
		contract: ref.contract,
		topic: ref.topic,
		topicPath: `/sentiment/topics/${ref.topic}`,
		votable: true
	}));
}

export function vpMsigPollRows(summary: VpSummary, lang?: string): VpMsigPollRow[] {
	const rows: VpMsigPollRow[] = [];
	for (const step of vpMsigSteps(summary, lang)) {
		// A planned step has no msig, so the sentiment contract has nothing to poll on.
		if (step.planned || !step.proposer || !step.proposal || !step.msigPath) continue;
		rows.push({
			kind: 'msig',
			step: step.step,
			title: step.title,
			proposer: step.proposer,
			proposal: step.proposal,
			msigPath: step.msigPath,
			status: step.status,
			votable: step.live,
			supersededAttempts: step.supersededAttempts
		});
	}
	return rows;
}

export type VpLens = 'system' | 'ram' | 'vote' | 'accounts';

export function vpSentimentRowKey(row: VpSentimentRowModel): string {
	switch (row.kind) {
		case 'proposal':
			return `topic:${row.topic}`;
		case 'msig':
			return `msigvote:${row.proposer}/${row.proposal}`;
	}
}
