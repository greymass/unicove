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
