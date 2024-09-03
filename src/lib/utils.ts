import type { ABI } from '@wharfkit/antelope';
import yaml from 'yaml';

export function getCacheHeaders(ttl: number, irreversible: boolean = false) {
	// Maintain a ttl cache by default
	let browser = `public, max-age=${ttl}, s-max-age=${ttl}`;
	let cloudflare = `max-age=${ttl}, s-max-age=${ttl}`;

	// If the data is irreversible, set 1 year and immutable
	if (irreversible) {
		browser = `public, max-age=31536000, s-max-age=31536000, immutable`;
		cloudflare = `max-age=31536000, s-max-age=31536000`;
	}

	return {
		'cache-control': browser,
		'cloudflare-cdn-cache-control': cloudflare
	};
}

export function preventDefault(fn: (event: Event) => void) {
	return function (event: Event) {
		event.preventDefault();
		fn.call(this, event);
	};
}

export const ricardianRegExp = new RegExp(/---(\n.*?\n)---\n\n(.*)+/s);

export interface RicardianMeta {
	spec_version: string;
	title: string;
	icon: string;
	summary: string;
}

export interface RicardianData {
	meta?: RicardianMeta;
	text?: string;
}

export function parseRicardian(action: ABI.Action | undefined): RicardianData | undefined {
	if (!action) {
		return undefined;
	}

	const ricardianData = action ? ricardianRegExp.exec(action.ricardian_contract) : [];

	const meta: RicardianMeta =
		ricardianData && ricardianData.length ? yaml.parse(ricardianData[1]) : undefined;
	const text = ricardianData && ricardianData.length ? ricardianData[2] : undefined;
	return {
		meta,
		text
	};
}
