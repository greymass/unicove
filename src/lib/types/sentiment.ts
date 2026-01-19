import type { Asset } from '@wharfkit/antelope';

export interface Topic {
	id: string;
	description: string;
	lastUpdated: string;
}

export interface SentimentStatistics {
	totalVotes: number;
	supportVotes: number;
	oppositionVotes: number;
	totalWeight: number;
	totalSupportWeight: number;
	totalOppositionWeight: number;
	supportPercentage: number;
	oppositionPercentage: number;
	totalWeightAsset: Asset;
	totalSupportWeightAsset: Asset;
	totalOppositionWeightAsset: Asset;
}

export type TopicStatistics = SentimentStatistics;
export type MsigStatistics = SentimentStatistics;

export interface TopicWithStats {
	topic: Topic;
	statistics: SentimentStatistics;
}

export interface VoteWithWeight {
	voter: string;
	voteType: number;
	weight: number;
	lastUpdated: string;
}

export interface PaginationMeta {
	limit: number;
	page: number;
	totalPages: number;
	total: number;
	hasMore: boolean;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

export interface TopicsListData {
	topics: TopicWithStats[];
	pagination: PaginationMeta;
}

export interface TopicDetailData {
	topic: Topic;
	statistics: SentimentStatistics;
}

export interface TopicVotesData {
	votes: VoteWithWeight[];
	pagination: PaginationMeta;
}

export interface MsigProposal {
	proposer: string;
	proposalName: string;
	lastUpdated: string;
}

export interface MsigWithStats {
	msig: MsigProposal;
	statistics: SentimentStatistics;
}

export interface MsigsListData {
	msigs: MsigWithStats[];
	pagination: PaginationMeta;
}

export interface MsigDetailData {
	msig: MsigProposal;
	statistics: SentimentStatistics;
}

export interface MsigVotesData {
	votes: VoteWithWeight[];
	pagination: PaginationMeta;
}
