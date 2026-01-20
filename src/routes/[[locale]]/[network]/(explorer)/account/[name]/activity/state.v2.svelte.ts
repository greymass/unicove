import { type API } from '@wharfkit/antelope';
import { ActivityResponseAction } from '$lib/types/transaction';
import { localizePath } from '$lib/utils/url';

export class Activity2Scene {
	firstTime: number = $state(0);
	updatedTime: number = $state(0);
	list: ActivityResponseAction[] = $state([]);
	nextCursor: string | undefined = $state(undefined);
	prevCursor: string | undefined = $state(undefined);
	isLoading: boolean = $state(false);
	hasNext: boolean = $state(false);
	hasPrev: boolean = $state(false);

	setLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}

	setList(list: ActivityResponseAction[], nextCursor?: string, prevCursor?: string) {
		this.list = [...list];
		this.isLoading = false;
		this.nextCursor = nextCursor;
		this.prevCursor = prevCursor;
		this.hasNext = !!nextCursor && list.length > 0;
		this.hasPrev = !!prevCursor;
		this.firstTime = this.updatedTime = Date.now();
	}

	reset() {
		this.firstTime = 0;
		this.updatedTime = 0;
		this.list = [];
		this.nextCursor = undefined;
		this.prevCursor = undefined;
		this.isLoading = false;
		this.hasNext = false;
		this.hasPrev = false;
	}
}

export class Activity2Loader {
	private static instance: Activity2Loader;

	private network: string;
	private fetch: typeof fetch;
	private account?: string;
	private contract?: string;
	private action?: string;
	private date?: string;
	private startDate?: string;
	private endDate?: string;
	private order: 'asc' | 'desc' = 'desc';
	private limit: number = 20;

	public filtering = $state(false);
	public scene: Activity2Scene = $state(new Activity2Scene());

	private constructor(network: string, fetchOverride: typeof fetch) {
		this.network = network;
		this.fetch = fetchOverride;
	}

	public static getInst(network: string, fetchOverride: typeof fetch): Activity2Loader {
		if (!Activity2Loader.instance || Activity2Loader.instance.network !== network) {
			Activity2Loader.instance = new Activity2Loader(network, fetchOverride);
		}
		return Activity2Loader.instance;
	}

	public setAccount(account: string) {
		if (this.account !== account) {
			this.account = account;
			this.scene.reset();
		} else if (Date.now() - this.scene.updatedTime > 10_000) {
			this.scene.reset();
		}
	}

	public setContract(contract: string) {
		this.contract = contract;
	}

	public setAction(action: string) {
		this.action = action;
	}

	public setDate(date: string) {
		this.date = date;
	}

	public setDateRange(startDate: string, endDate: string) {
		this.startDate = startDate;
		this.endDate = endDate;
	}

	public setOrder(order: 'asc' | 'desc') {
		this.order = order;
	}

	public setLimit(limit: number) {
		this.limit = limit;
	}

	public load(cursor?: string) {
		if (!this.account) throw new Error('set account first');
		if (this.scene.isLoading) return;
		this.loadRemote(cursor);
	}

	public loadNext() {
		if (!this.account) throw new Error('set account first');
		if (this.scene.isLoading || !this.scene.hasNext) return;
		this.loadRemote(this.scene.nextCursor);
	}

	public loadPrev() {
		if (!this.account) throw new Error('set account first');
		if (this.scene.isLoading || !this.scene.hasPrev) return;
		this.loadRemote(this.scene.prevCursor);
	}

	private async loadRemote(cursor?: string) {
		try {
			if (!this.account) return;
			const account = this.account;
			this.scene.setLoading(true);

			const params = new URLSearchParams();
			if (cursor) {
				params.set('cursor', cursor);
			}
			if (this.contract) {
				params.set('contract', this.contract);
			}
			if (this.action) {
				params.set('action', this.action);
			}
			if (this.date) {
				params.set('date', this.date);
			}
			if (this.startDate) {
				params.set('start_date', this.startDate);
			}
			if (this.endDate) {
				params.set('end_date', this.endDate);
			}
			if (this.order !== 'desc') {
				params.set('order', this.order);
			}
			if (this.limit !== 20) {
				params.set('limit', String(this.limit));
			}

			this.filtering = !!(this.contract || this.action || this.date || this.startDate || this.endDate || this.order !== 'desc' || this.limit !== 20);

			const queryString = params.toString();
			const path = localizePath(
				`/api/account/${account}/activity2${queryString ? `?${queryString}` : ''}`
			);

			const response = await this.fetch(path);
			if (!response.ok) {
				throw new Error(`Error while loading activity for ${account}.`);
			}
			const json = await response.json();
			const { results, next_cursor, prev_cursor } = json.activity;

			const actions = this.transformResults(results);

			this.scene.setList(actions, next_cursor, prev_cursor);
		} catch (error: unknown) {
			console.error('Error fetching activity actions:', error);
		} finally {
			this.scene.setLoading(false);
		}
	}

	private transformResults(results: API.v1.OrderedActionsResult[]): ActivityResponseAction[] {
		return results.map((result) => {
			const trace = result.action_trace;
			return ActivityResponseAction.from({
				global_action_seq: result.global_action_seq,
				account_action_seq: result.account_action_seq,
				block_num: result.block_num,
				block_time: result.block_time,
				action_trace: trace
			});
		});
	}
}
