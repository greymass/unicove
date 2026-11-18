export const BACKOFF_MIN_MS = 500;
export const BACKOFF_MAX_MS = 15_000;
export const BACKOFF_JITTER = 0.3;
export const HIDDEN_CLOSE_MS = 60_000;
export const PING_INTERVAL_MS = 20_000;

export type FinalityConnection = 'connecting' | 'open' | 'reconnecting';

export function feedUrl(base: string, network: string, from: number | null): string {
	const url = `${base.replace(/\/+$/, '')}/v1/${network}`;
	return from === null ? url : `${url}?from=${from}`;
}

export function backoffDelay(attempt: number, random = Math.random()): number {
	const base = Math.min(BACKOFF_MAX_MS, BACKOFF_MIN_MS * 2 ** attempt);
	return Math.round(base * (1 + random * BACKOFF_JITTER));
}
