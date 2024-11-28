import { browser } from '$app/environment';

export interface SettingsEntry {
	key: string;
	value: unknown;
}

export type SettingsData = Record<string, unknown>;

export class SettingsState {
	data = $state<SettingsData>({});

	constructor() {
		if (browser) {
			const item = localStorage.getItem('unicove-settings');
			if (item) this.data = this.deserialize(item);
		}
		$effect(() => {
			localStorage.setItem('unicove-settings', this.serialize(this.data));
		});
	}

	get<T>(key: string, value: T) {
		if (!this.data[key]) {
			return value;
		}
		return this.data[key] as T;
	}

	serialize(data: SettingsData): string {
		return JSON.stringify(data);
	}

	deserialize(item: string): SettingsData {
		return JSON.parse(item);
	}
}
