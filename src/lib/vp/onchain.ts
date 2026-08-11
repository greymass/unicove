import type { VpMsigStatus, VpSummary } from './types';

export interface VpMsigCardModel {
	proposer: string;
	proposal: string;
	status: VpMsigStatus;
	msigPath: string;
	txPath: string | null;
	live: boolean;
}

export function msigCardModels(summary: VpSummary): VpMsigCardModel[] {
	return summary.msigs.map((m) => ({
		proposer: m.proposer,
		proposal: m.proposal,
		status: m.status,
		msigPath: `/msig/${m.proposer}/${m.proposal}`,
		txPath: m.status === 'executed' && m.txid ? `/transaction/${m.txid}` : null,
		live: m.status === 'active'
	}));
}

export function sentimentTopicPath(ref: { contract: string; topic: string }): string {
	return `/sentiment/topics/${ref.topic}`;
}
