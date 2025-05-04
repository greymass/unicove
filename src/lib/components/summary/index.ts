import type { Component } from 'svelte';

// Contract action summary components
import eosio from '$lib/components/summary/eosio/index.js';
import token from '$lib/components/summary/eosio.token/index.js';
import greymassnoop from '$lib/components/summary/greymassnoop/index.js';
import type { ObjectifiedActionData } from '$lib/types/transaction';
import { Asset, Name } from '@wharfkit/antelope';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const summaries: Record<string, any> = {
	eosio: eosio,
	'core.vaulta': eosio,
	'eosio.token': token,
	greymassnoop
};

export function isStandardTokenTransfer(data: ObjectifiedActionData) {
	const from = data?.from && Name.from(data.from).equals(data.from);
	const to = data?.to && Name.from(data.to).equals(data.to);
	const quantity = data?.quantity && Asset.from(data.quantity).equals(data.quantity);
	return from && to && quantity;
}

export function getActionSummaryComponent(
	contract: string,
	action: string,
	data?: ObjectifiedActionData
): Component | undefined {
	if (data && isStandardTokenTransfer(data)) {
		return summaries['eosio.token'].transfer;
	}
	const summary = summaries[contract];
	if (!summary) return undefined;
	return summary[action];
}
