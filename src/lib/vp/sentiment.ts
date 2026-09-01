import type { VpMsigStep } from './onchain';
import type { VpSummary } from './types';

export interface VpProposalTopicRow {
	kind: 'proposal';
	contract: string;
	topic: string;
	topicPath: string;
	votable: true;
}

export function vpProposalTopicRows(summary: VpSummary): VpProposalTopicRow[] {
	return summary.sentiment.map((ref) => ({
		kind: 'proposal',
		contract: ref.contract,
		topic: ref.topic,
		topicPath: `/sentiment/topics/${ref.topic}`,
		votable: true
	}));
}

export function vpStepHasPoll(step: VpMsigStep): boolean {
	return !step.planned && Boolean(step.proposer && step.proposal && step.msigPath);
}

export type VpLens = 'system' | 'ram' | 'vote' | 'accounts';

export interface VpStepTally {
	totalVotes: number;
	supportPercentage: number;
	oppositionPercentage: number;
}

interface VpWeightTotals {
	totalVotes: number;
	totalSupportWeight: number;
	totalOppositionWeight: number;
}

export function vpApplyOwnVote(
	statistics: VpWeightTotals,
	previousVote: number | null,
	nextVote: number | null,
	weight: number
): VpStepTally {
	let support = statistics.totalSupportWeight;
	let opposition = statistics.totalOppositionWeight;
	let votes = statistics.totalVotes;

	if (previousVote === 1) support -= weight;
	if (previousVote === 0) opposition -= weight;
	if (previousVote !== null) votes -= 1;

	if (nextVote === 1) support += weight;
	if (nextVote === 0) opposition += weight;
	if (nextVote !== null) votes += 1;

	support = Math.max(support, 0);
	opposition = Math.max(opposition, 0);
	votes = Math.max(votes, 0);

	const total = support + opposition;
	return {
		totalVotes: votes,
		supportPercentage: total ? (support / total) * 100 : 0,
		oppositionPercentage: total ? (opposition / total) * 100 : 0
	};
}
