import { ABI, Asset, type NameType } from '@wharfkit/antelope';
import yaml from 'yaml';

export * from './strings';
export * from './ricardian';
export * from './style';

export function calculateValue(balance: Asset, currency: Asset): Asset {
	return Asset.from(
		`${(currency.value * balance.value).toFixed(currency.symbol.precision)} ${currency.symbol.code}`
	);
}

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

export function preventDefault<TThis>(fn: (this: TThis, event: Event) => void) {
	return function (this: TThis, event: Event) {
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

export function detectEnvironment(): 'mobile' | 'desktop' | undefined {
	if (typeof window === 'undefined') {
		// Server-side rendering
		return;
	}

	const userAgent = window.navigator.userAgent.toLowerCase();
	const mobileKeywords = [
		'android',
		'webos',
		'iphone',
		'ipad',
		'ipod',
		'blackberry',
		'windows phone'
	];

	return mobileKeywords.some((keyword) => userAgent.includes(keyword)) ? 'mobile' : 'desktop';
}

export interface TokenKeyParams {
	contract: NameType;
	symbol: NameType;
}

export function isSameToken(token1?: TokenKeyParams, token2?: TokenKeyParams): boolean {
	if (!token1 || !token2) return false;
	return (
		String(token1.contract) === String(token2.contract) &&
		String(token1.symbol) === String(token2.symbol)
	);
}
