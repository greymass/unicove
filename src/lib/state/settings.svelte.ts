import { browser } from '$app/environment';
import type { ActionDisplayVariants } from '$lib/types';

export enum SettingKeys {
	'actionDisplayVariant' = 'actionDisplayVariant',
	'advancedMode' = 'advancedMode',
	'debugMode' = 'debugMode',
	'preventAccountPageSwitching' = 'preventAccountPageSwitching',
	'searchAccountSwitch' = 'searchAccountSwitch',
	'searchShowPages' = 'searchShowPages'
}

export enum TimeSeconds {
	'1m' = 60,
	'5m' = 300,
	'10m' = 600,
	'15m' = 900,
	'30m' = 1800,
	'1h' = 3600,
	'2h' = 7200,
	'4h' = 14400,
	'8h' = 28800,
	'12h' = 43200,
	'1d' = 86400,
	'2d' = 172800,
	'3d' = 259200,
	'1w' = 604800,
	'2w' = 1209600,
	'1mo' = 2592000,
	'3mo' = 7776000,
	'6mo' = 15552000,
	'1y' = 31536000
}

export interface SettingsData {
	actionDisplayVariant?: ActionDisplayVariants;
	advancedMode?: boolean;
	debugMode?: boolean;
	preventAccountPageSwitching?: boolean;
	searchAccountSwitch?: boolean;
	searchShowPages?: boolean;
}

export class SettingsState {
	data = $state<SettingsData>({
		actionDisplayVariant: 'pretty',
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
