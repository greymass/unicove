import { browser } from '$app/environment';

export class SettingState<T> {
	value = $state<T>() as T;
	key = '';

	constructor(key: string, value: T) {
		this.key = key;
		this.value = value;

		if (browser) {
			const item = localStorage.getItem(key);
			if (item) this.value = this.deserialize(item);
		}

		$effect(() => {
			localStorage.setItem(this.key, this.serialize(this.value));
		});
	}

	serialize(value: T): string {
		return JSON.stringify(value);
	}

	deserialize(item: string): T {
		return JSON.parse(item);
	}
}

const state = new Map<string, SettingState<unknown>>();

export function getSetting<T>(key: string, value: T) {
	if (!state.has(key)) {
		state.set(key, new SettingState(key, value));
	}
	return state.get(key) as SettingState<T>;
}
