import { ActivityAction, type ActivityActionWrapper } from '$lib/types';
import { convertActivityActions } from '$lib/utils';

export class Scene {
	firstTime: number = $state(0);
	updatedTime: number = $state(0);
	list: ActivityActionWrapper[] = $state([]);
	loadStart: number = $state(0);
	isLoading: boolean = $state(false);
	hasMore: boolean = $state(false);

	setLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}

	setList(list: ActivityActionWrapper[], loadStart: number, hasMore: boolean) {
		this.list = [...list];
		this.isLoading = false;
		this.loadStart = loadStart;
		this.hasMore = hasMore;
		this.firstTime = this.updatedTime = Date.now();
	}

	appendList(list: ActivityActionWrapper[], loadStart: number, hasMore: boolean) {
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
	private account?: string;

	public scene: Scene = $state(new Scene());

	private constructor(network: string) {
		this.network = network;
	}

	public static getInst(network: string): ActivityLoader {
		if (!ActivityLoader.instance || ActivityLoader.instance.network !== network) {
			ActivityLoader.instance = ActivityLoader.instance = new ActivityLoader(network);
		}
		return ActivityLoader.instance;
	}

	public setAccount(account: string) {
		console.log('................setAccount');
		if (this.account !== account) {
			this.account = account;
			this.scene.reset();
		} else if (this.scene.updatedTime > Date.now() - 10_000) {
			this.scene.reset();
		}
	}

	public load() {
		console.log('................load');
		if (!this.account) {
			throw new Error('set account first');
		}
		if (this.scene.isLoading) {
			return;
		}
		this.loadRemote(false);
	}

	public laodMore() {
		console.log('................laodMore');
		if (!this.account) {
			throw new Error('set account first');
		}
		if (this.scene.isLoading || !this.scene.hasMore) return;

		this.loadRemote(true);
	}

	private async loadRemote(more: boolean) {
		try {
			this.scene.setLoading(true);
			const startIndex = more ? this.scene!.loadStart : 1;
			console.log('refresh..................., startIndex = ', startIndex);
			const response = await fetch(
				`/${this.network}/api/account/${this.account}/activity/${startIndex}`
			);
			const json: { activity: { actions: string[]; first: number; last: number } } =
				await response.json();

			const activityActions: ActivityAction[] = [];
			json.activity.actions.forEach((item) => {
				try {
					activityActions.push(ActivityAction.from(item));
				} catch (e) {
					console.error('conver to ActivityAction error ', e);
				}
			});
			const newBatch = convertActivityActions(this.account!, this.network, activityActions);
			const nextStart = -json.activity.last;
			const hasMore = newBatch.length > 0 && json.activity.last > 0;
			const now = Date.now();
			if (!more) {
				console.log(
					'newList = ',
					newBatch.length,
					', nextStart = ',
					nextStart,
					', hasMore = ',
					hasMore
				);
				this.scene.setList(newBatch, nextStart, hasMore);
			} else {
				console.log(
					'appendList = ',
					newBatch.length,
					', nextStart = ',
					nextStart,
					', hasMore = ',
					hasMore
				);
				this.scene.appendList(newBatch, nextStart, hasMore);
			}
			console.log('refresh....finish');
		} catch (error: unknown) {
			console.log('refresh....error');
			console.error('Error fetching activity actions:', error);
		} finally {
			this.scene.setLoading(false);
		}
	}
}
