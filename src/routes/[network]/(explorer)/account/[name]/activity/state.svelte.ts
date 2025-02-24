import {
	ActionTraceFiltered,
	ActionTraceReceipt,
	ActivityResponse,
	ActivityResponseAction
} from '$lib/types/transaction';
import { Checksum256, UInt64 } from '@wharfkit/session';

export class Scene {
	firstTime: number = $state(0);
	updatedTime: number = $state(0);
	list: ActivityResponseAction[] = $state([]);
	loadStart: number = $state(0);
	isLoading: boolean = $state(false);
	hasMore: boolean = $state(false);

	setLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}

	setList(list: ActivityResponseAction[], loadStart: number, hasMore: boolean) {
		this.list = [...list];
		this.isLoading = false;
		this.loadStart = loadStart;
		this.hasMore = hasMore;
		this.firstTime = this.updatedTime = Date.now();
	}

	appendList(list: ActivityResponseAction[], loadStart: number, hasMore: boolean) {
		this.list = [...this.list, ...list];
		this.isLoading = false;
		this.loadStart = loadStart;
		this.hasMore = hasMore;
		this.updatedTime = Date.now();
	}

	reset() {
		this.firstTime = 0;
		this.updatedTime = 0;
		this.list = [];
		this.loadStart = 0;
		this.isLoading = false;
		this.hasMore = false;
	}
}

export class ActivityLoader {
	private static instance: ActivityLoader;

	private network: string;
	private fetch: typeof fetch;
	private account?: string;

	public scene: Scene = $state(new Scene());

	private constructor(network: string, fetchOverride: typeof fetch) {
		this.network = network;
		this.fetch = fetchOverride;
	}

	public static getInst(network: string, fetchOverride: typeof fetch): ActivityLoader {
		if (!ActivityLoader.instance || ActivityLoader.instance.network !== network) {
			ActivityLoader.instance = ActivityLoader.instance = new ActivityLoader(
				network,
				fetchOverride
			);
		}
		return ActivityLoader.instance;
	}

	public setAccount(account: string) {
		if (this.account !== account) {
			this.account = account;
			this.scene.reset();
		} else if (Date.now() - this.scene.updatedTime > 10_000) {
			this.scene.reset();
		}
	}

	public load() {
		if (!this.account) throw new Error('set account first');

		if (this.scene.isLoading) return;

		this.loadRemote(false);
	}

	public loadMore() {
		if (!this.account) throw new Error('set account first');

		if (this.scene.isLoading || !this.scene.hasMore) return;

		this.loadRemote(true);
	}

	public makeKey(trx: Checksum256, act: Checksum256) {
		return `${trx}-${act}`;
	}

	private async loadRemote(more: boolean) {
		try {
			if (!this.account) return;
			const account = this.account;
			this.scene.setLoading(true);
			const startIndex = more ? this.scene!.loadStart : 1;
			const response = await this.fetch(
				`/${this.network}/api/account/${account}/activity/${startIndex}`
			);
			if (!response.ok) {
				throw new Error(`Error while loading activity for ${account}.`);
			}
			const json = await response.json();
			const activity = ActivityResponse.from(json.activity);
			const nextStart = -Number(activity.last);
			const hasMore = activity.actions.length > 0 && activity.last.gt(UInt64.from(0));

			const digests: string[] = [];
			const receipts: Record<string, ActionTraceReceipt[]> = {};
			const filtered = activity.actions
				.filter((action) => {
					const key = this.makeKey(action.trace.trx_id, action.trace.receipt.act_digest);
					if (!receipts[key]) {
						receipts[key] = [];
					}
					receipts[key].push(action.trace.receipt);
					if (digests.includes(key)) {
						return false;
					}
					digests.push(key);
					return true;
				})
				.map((action) => {
					const key = this.makeKey(action.trace.trx_id, action.trace.receipt.act_digest);
					return ActivityResponseAction.from({
						...action,
						action_trace: ActionTraceFiltered.from({
							...action.action_trace,
							receipts: receipts[key]
						})
					});
				});
			if (!more) {
				this.scene.setList(filtered, nextStart, hasMore);
			} else {
				this.scene.appendList(filtered, nextStart, hasMore);
			}
		} catch (error: unknown) {
			console.error('Error fetching activity actions:', error);
		} finally {
			this.scene.setLoading(false);
		}
	}
}
