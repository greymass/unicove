import { browser } from '$app/environment';

export enum SettingKeys {
	'actionDisplayVariant' = 'actionDisplayVariant',
	'advancedMode' = 'advancedMode',
	'debugMode' = 'debugMode',
	'preventAccountPageSwitching' = 'preventAccountPageSwitching',
	'searchAccountSwitch' = 'searchAccountSwitch',
	'searchShowPages' = 'searchShowPages'
}

export type SettingsData = Record<SettingKeys, unknown>;

export class SettingsState {
	data = $state<SettingsData>({
		actionDisplayVariant: 'summary',
		advancedMode: false,
		debugMode: false,
		preventAccountPageSwitching: false,
		searchAccountSwitch: false,
		searchShowPages: true
	});

	constructor() {
		if (browser) {
			const item = localStorage.getItem('unicove-settings');
			if (item) this.data = this.deserialize(item);
		}
		$effect(() => {
			localStorage.setItem('unicove-settings', this.serialize(this.data));
		});
	}

	get<T>(key: SettingKeys, value: T) {
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
