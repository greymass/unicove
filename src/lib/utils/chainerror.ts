import { APIError } from '@wharfkit/antelope';

const NOT_FOUND_ERRORS = ['unknown_block_exception', 'account_query_exception'];

// A chain error means "does not exist" only for these cases; everything else is an outage.
export function chainErrorStatus(e: unknown): 404 | 503 {
	if (e instanceof APIError) {
		if (e.response.status === 404) return 404;
		const name = e.response.json?.error?.name;
		if (name && NOT_FOUND_ERRORS.includes(name)) return 404;
	}
	return 503;
}
