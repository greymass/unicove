import { ActivityAction, type ActivityActionWrapper } from '$lib/types';
import { convertActivityAction } from '$lib/utils';

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

	public laodMore() {
		if (!this.account) throw new Error('set account first');

		if (this.scene.isLoading || !this.scene.hasMore) return;

		this.loadRemote(true);
	}

	private async loadRemote(more: boolean) {
		try {
			this.scene.setLoading(true);
			const startIndex = more ? this.scene!.loadStart : 1;
			const response = await fetch(
				`/${this.network}/api/account/${this.account}/activity/${startIndex}`
			);
			const json: { activity: { actions: string[]; first: number; last: number } } =
				await response.json();

			const newBatch: ActivityActionWrapper[] = [];
			json.activity.actions.forEach((item) => {
				let action = undefined;
				try {
					action = ActivityAction.from(item);
				} catch (e) {
					console.error('Conver to ActivityAction error ', e);
				}
				if (action) {
					const actionWrapper = convertActivityAction(this.account!, action);
					if (actionWrapper) {
						newBatch.push(actionWrapper);
					}
				}
			});
			const nextStart = -json.activity.last;
			const hasMore = newBatch.length > 0 && json.activity.last > 0;
			if (!more) {
				this.scene.setList(newBatch, nextStart, hasMore);
			} else {
				this.scene.appendList(newBatch, nextStart, hasMore);
			}
		} catch (error: unknown) {
			console.error('Error fetching activity actions:', error);
		} finally {
			this.scene.setLoading(false);
		}
	}
}
