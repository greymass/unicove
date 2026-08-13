import type { NameType } from '@wharfkit/antelope';
import { Asset, Name } from '@wharfkit/antelope';
import type { NetworkState } from '$lib/state/network.svelte';
import type {
	MsigWithStats,
	VoteWithWeight,
	PaginationMeta,
	ApiResponse,
	MsigsListData,
	MsigDetailData,
	MsigVotesData,
	MsigStatistics,
	MetricLens
} from '$lib/types/sentiment';

export class MsigSentimentState {
	public network: NetworkState;
	private apiBaseUrl: string;

	public msigs = $state<MsigWithStats[]>([]);
	public currentMsig = $state<MsigDetailData | null>(null);
	public currentVotes = $state<VoteWithWeight[]>([]);
	public currentUserVote = $state<{
		voter: string;
		proposer: string;
		proposal_name: string;
		vote_type: number;
	} | null>(null);
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

	private serializeStatistics(statistics: MsigStatistics): MsigStatistics {
		const systemTokenSymbol = this.network.chain.systemToken?.symbol;
		if (!systemTokenSymbol) {
			throw new Error('network systemToken is not configured');
		}

		return {
			...statistics,
			supportPercentage: Math.round(statistics.supportPercentage),
			oppositionPercentage: Math.round(statistics.oppositionPercentage),
			totalWeightAsset: Asset.fromUnits(statistics.totalWeight, systemTokenSymbol),
			totalSupportWeightAsset: Asset.fromUnits(statistics.totalSupportWeight, systemTokenSymbol),
			totalOppositionWeightAsset: Asset.fromUnits(
				statistics.totalOppositionWeight,
				systemTokenSymbol
			)
		};
	}

	async loadMsigs(page = 1, limit = 20): Promise<void> {
		this.loading = true;
		this.error = null;

		try {
			const url = `${this.apiBaseUrl}/msigs?page=${page}&limit=${limit}`;

			const response = await this.network.fetch(url);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<MsigsListData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load msigs');
			}

			this.msigs = result.data.msigs.map((msig) => ({
				...msig,
				statistics: this.serializeStatistics(msig.statistics)
			}));
			this.pagination = result.data.pagination;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load msigs';
			console.error('Error loading msigs:', e);
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
			const url = `${this.apiBaseUrl}/msigs?page=${nextPage}&limit=${limit}`;

			const response = await this.network.fetch(url);
			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<MsigsListData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load more msigs');
			}

			const newMsigs = result.data.msigs.map((msig) => ({
				...msig,
				statistics: this.serializeStatistics(msig.statistics)
			}));
			this.msigs = [...this.msigs, ...newMsigs];
			this.pagination = result.data.pagination;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load more msigs';
			console.error('Error loading more msigs:', e);
		} finally {
			this.loadingMore = false;
		}
	}

	async loadMsig(proposer: NameType, proposalName: NameType): Promise<void> {
		if (!this.refreshing) {
			this.loading = true;
		}

		this.error = null;

		try {
			const proposerStr = String(Name.from(proposer));
			const proposalStr = String(Name.from(proposalName));

			const url = `${this.apiBaseUrl}/msigs/${proposerStr}/${proposalStr}`;
			const response = await this.network.fetch(url);

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<MsigDetailData> = await response.json();

			if (!result.success || !result.data) {
				throw new Error(result.error || 'Failed to load msig');
			}

			const newData: MsigDetailData = {
				...result.data,
				statistics: this.serializeStatistics(result.data.statistics)
			};

			if (!this.currentMsig || JSON.stringify(this.currentMsig) !== JSON.stringify(newData)) {
				this.currentMsig = newData;
			}
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load msig';
			console.error(`Error loading msig ${proposer}/${proposalName}:`, e);
		} finally {
			if (!this.refreshing) {
				this.loading = false;
			}
		}
	}

	async loadMsigVotes(
		proposer: NameType,
		proposalName: NameType,
		page = 1,
		limit = 50,
		sort?: MetricLens
	): Promise<void> {
		if (!this.refreshing) {
			this.loading = true;
		}
		this.error = null;

		try {
			const proposerStr = String(Name.from(proposer));
			const proposalStr = String(Name.from(proposalName));

			const url = `${this.apiBaseUrl}/msigs/${proposerStr}/${proposalStr}/votes?page=${page}&limit=${limit}${sort ? `&sort=${sort}` : ''}`;

			const response = await this.network.fetch(url);

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const result: ApiResponse<MsigVotesData> = await response.json();

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
			console.error(`Error loading votes for msig ${proposer}/${proposalName}:`, e);
		} finally {
			if (!this.refreshing) {
				this.loading = false;
			}
		}
	}

	async loadUserVote(voter: NameType, proposer: NameType, proposalName: NameType): Promise<void> {
		try {
			const result = await this.network.contracts.sentiment.readonly('getmsigvote', {
				voter: Name.from(voter),
				proposer: Name.from(proposer),
				proposal_name: Name.from(proposalName)
			});

			if (result) {
				this.currentUserVote = {
					voter: String(result.voter),
					proposer: String(result.proposer),
					proposal_name: String(result.proposal_name),
					vote_type: Number(result.vote_type)
				};
			} else {
				this.currentUserVote = null;
			}
		} catch {
			this.currentUserVote = null;
		}
	}

	updateUserVote(
		voter: NameType,
		proposer: NameType,
		proposalName: NameType,
		voteType: number | null
	): void {
		const voterStr = String(Name.from(voter));
		const proposerStr = String(Name.from(proposer));
		const proposalStr = String(Name.from(proposalName));

		if (voteType === null) {
			this.currentUserVote = null;
		} else {
			this.currentUserVote = {
				voter: voterStr,
				proposer: proposerStr,
				proposal_name: proposalStr,
				vote_type: voteType
			};
		}
	}

	async refreshMsigAndVotes(
		proposer: NameType,
		proposalName: NameType,
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
			const promises = [
				this.loadMsig(proposer, proposalName),
				this.loadMsigVotes(proposer, proposalName, 1, 50, sort)
			];

			if (voter) {
				promises.push(this.loadUserVote(voter, proposer, proposalName));
			}

			await Promise.all(promises);
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to refresh data';
			console.error('Error refreshing msig and votes:', e);
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
