import type { NameType } from '@wharfkit/antelope';
import { Asset, Name } from '@wharfkit/antelope';
import type { NetworkState } from '$lib/state/network.svelte';
import type {
	TopicWithStats,
	VoteWithWeight,
	PaginationMeta,
	ApiResponse,
	TopicsListData,
	TopicDetailData,
	TopicVotesData,
	TopicStatistics,
	MetricLens
} from '$lib/types/sentiment';

export class TopicSentimentState {
	public network: NetworkState;
	private apiBaseUrl: string;

	public topics = $state<TopicWithStats[]>([]);
	public currentTopic = $state<TopicDetailData | null>(null);
	public currentVotes = $state<VoteWithWeight[]>([]);
	public currentUserVote = $state<{ voter: string; topic_id: string; vote_type: number } | null>(
		null
	);
	public loading = $state(false);
	public loadingMore = $state(false);
	public refreshing = $state(false);
	public loadingStatistics = $state(false);
	public error = $state<string | null>(null);
	public pagination = $state<PaginationMeta | null>(null);

	constructor(network: NetworkState, locale: string = 'en') {
		this.network = network;
		const networkShort = network.config.short;
		this.apiBaseUrl = `/${locale}/${networkShort}/api/sentiment`;
	}

	private serializeStatistics(statistics: TopicStatistics): TopicStatistics {
		const systemTokenSymbol = this.network.chain.systemToken?.symbol;
		if (!systemTokenSymbol) {
			throw new Error('network systemToken is not configured');
		}

		return {
			...statistics,
			totalWeightAsset: Asset.fromUnits(statistics.totalWeight, systemTokenSymbol),
			totalSupportWeightAsset: Asset.fromUnits(statistics.totalSupportWeight, systemTokenSymbol),
			totalOppositionWeightAsset: Asset.fromUnits(
				statistics.totalOppositionWeight,
				systemTokenSymbol
			)
		};
	}

	async loadTopics(page = 1, limit = 20): Promise<void> {
		this.loading = true;
		this.error = null;

		try {
			const url = `${this.apiBaseUrl}/topics?page=${page}&limit=${limit}`;

			const response = await this.network.fetch(url);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<TopicsListData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load topics');
			}

			this.topics = result.data.topics.map((topic) => ({
				...topic,
				statistics: this.serializeStatistics(topic.statistics)
			}));
			this.pagination = result.data.pagination;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load topics';
			console.error('Error loading topics:', e);
		} finally {
			this.loading = false;
		}
	}

	async loadMore(): Promise<void> {
		if (!this.pagination?.hasMore || this.loadingMore) {
			return;
		}

		this.loadingMore = true;
		this.error = null;

		try {
			const nextPage = this.pagination.page + 1;
			const limit = this.pagination.limit;
			const url = `${this.apiBaseUrl}/topics?page=${nextPage}&limit=${limit}`;

			const response = await this.network.fetch(url);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<TopicsListData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load more topics');
			}

			const newTopics = result.data.topics.map((topic) => ({
				...topic,
				statistics: this.serializeStatistics(topic.statistics)
			}));
			this.topics = [...this.topics, ...newTopics];
			this.pagination = result.data.pagination;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load more topics';
			console.error('Error loading more topics:', e);
		} finally {
			this.loadingMore = false;
		}
	}

	async loadTopic(topicId: NameType): Promise<void> {
		if (!this.refreshing) {
			this.loading = true;
		}

		this.error = null;

		try {
			const id = String(Name.from(topicId));

			const url = `${this.apiBaseUrl}/topics/${id}`;
			const response = await this.network.fetch(url);

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<TopicDetailData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load topic');
			}

			const newData: TopicDetailData = {
				...result.data,
				statistics: this.serializeStatistics(result.data.statistics)
			};

			if (!this.currentTopic || JSON.stringify(this.currentTopic) !== JSON.stringify(newData)) {
				this.currentTopic = newData;
			}
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load topic';
			console.error(`Error loading topic ${topicId}:`, e);
		} finally {
			if (!this.refreshing) {
				this.loading = false;
			}
		}
	}

	async loadTopicVotes(topicId: NameType, page = 1, limit = 50, sort?: MetricLens): Promise<void> {
		if (!this.refreshing) {
			this.loading = true;
		}
		this.error = null;

		try {
			const id = String(Name.from(topicId));

			const url = `${this.apiBaseUrl}/topics/${id}/votes?page=${page}&limit=${limit}${sort ? `&sort=${sort}` : ''}`;

			const response = await this.network.fetch(url);

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<TopicVotesData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load votes');
			}

			const newVotes = result.data.votes;
			const newPagination = result.data.pagination;

			if (JSON.stringify(this.currentVotes) !== JSON.stringify(newVotes)) {
				this.currentVotes = newVotes;
			}

			if (JSON.stringify(this.pagination) !== JSON.stringify(newPagination)) {
				this.pagination = newPagination;
			}
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load votes';
			console.error(`Error loading votes for topic ${topicId}:`, e);
		} finally {
			if (!this.refreshing) {
				this.loading = false;
			}
		}
	}

	async loadUserVote(voter: NameType, topicId: NameType): Promise<void> {
		try {
			const result = await this.network.contracts.sentiment.readonly('getvote', {
				voter: Name.from(voter),
				topic_id: Name.from(topicId)
			});

			if (result) {
				this.currentUserVote = {
					voter: String(result.voter),
					topic_id: String(result.topic_id),
					vote_type: Number(result.vote_type)
				};
			} else {
				this.currentUserVote = null;
			}
		} catch {
			this.currentUserVote = null;
		}
	}

	updateUserVote(voter: NameType, topicId: NameType, voteType: number | null): void {
		const voterStr = String(Name.from(voter));
		const topicIdStr = String(Name.from(topicId));

		if (voteType === null) {
			this.currentUserVote = null;
		} else {
			this.currentUserVote = {
				voter: voterStr,
				topic_id: topicIdStr,
				vote_type: voteType
			};
		}
	}

	async refreshTopicAndVotes(
		topicId: NameType,
		silent = false,
		voter?: NameType,
		showStatisticsLoader = false,
		sort?: MetricLens
	): Promise<void> {
		if (!silent) {
			this.refreshing = true;
		}
		if (showStatisticsLoader) {
			this.loadingStatistics = true;
		}
		this.error = null;

		try {
			const promises = [this.loadTopic(topicId), this.loadTopicVotes(topicId, 1, 50, sort)];

			if (voter) {
				promises.push(this.loadUserVote(voter, topicId));
			}

			await Promise.all(promises);
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to refresh data';
			console.error('Error refreshing topic and votes:', e);
		} finally {
			if (!silent) {
				this.refreshing = false;
			}
			if (showStatisticsLoader) {
				this.loadingStatistics = false;
			}
		}
	}
}
