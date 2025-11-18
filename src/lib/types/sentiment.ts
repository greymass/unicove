import type { Asset } from '@wharfkit/antelope';

export interface Topic {
	id: string;
	description: string;
	lastUpdated: string;
}

export interface TopicStatistics {
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

export interface TopicWithStats {
	topic: Topic;
	statistics: TopicStatistics;
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
	statistics: TopicStatistics;
}

export interface TopicVotesData {
	votes: VoteWithWeight[];
	pagination: PaginationMeta;
}
