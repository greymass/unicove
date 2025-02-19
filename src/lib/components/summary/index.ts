import type { Component } from 'svelte';

// Contract action summary components
import eosio from '$lib/components/summary/eosio/index.js';
import token from '$lib/components/summary/eosio.token/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const summaries: Record<string, any> = {
	eosio: eosio,
	'eosio.token': token
};

export function getActionSummaryComponent(contract: string, action: string): Component | undefined {
	const summary = summaries[contract];
	if (!summary) return undefined;
	return summary[action];
}
