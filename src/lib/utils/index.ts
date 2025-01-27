import { languageTag } from '$lib/paraglide/runtime';
import { goto as svelteGoto } from '$app/navigation';
import { Asset, type NameType } from '@wharfkit/antelope';

export * from './strings';
export * from './ricardian';
export * from './resources';
export * from './style';
export * from './transactions';

export function calculateValue(balance: Asset, currency: Asset): Asset {
	return Asset.from(
		`${(currency.value * balance.value).toFixed(currency.symbol.precision)} ${currency.symbol.code}`
	);
}

export function getCacheHeaders(ttl: number, irreversible: boolean = false) {
	// Maintain a ttl cache by default
	let browser = `public, max-age=${ttl}, s-max-age=${ttl}, stale-while-revalidate=${ttl}`;
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

/**
 * Adds the language tag prefix to the built-in svelte goto()
 * @example "/eos/account/123" => "/en/eos/account/123"
 */
export const goto: typeof svelteGoto = (url, opts = {}) => {
	return svelteGoto(`/${languageTag()}${url}`, opts);
};

/**
 * Retrieves the opengraph image for a specified route
 */
export function getOgImage(route = 'default'): string {
	const path = new URL(`../assets/opengraph/${languageTag()}/${route}.png`, import.meta.url)
		.pathname;

	// if image doesn't exist for the route/lang combo, use the default
	if (path.includes('undefined')) {
		return new URL(`../assets/opengraph/${languageTag()}/default.png`, import.meta.url).pathname;
	}

	return path;
}
