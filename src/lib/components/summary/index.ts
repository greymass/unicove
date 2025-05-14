import type { Component } from 'svelte';
import { Asset, Name } from '@wharfkit/antelope';

import type { ObjectifiedActionData } from '$lib/types/transaction';
import { ramtoken, systemtoken } from '$lib/wharf/chains';
import * as m from '$lib/paraglide/messages';

// Contract action summary components
import eosio from '$lib/components/summary/eosio';
import reserv from '$lib/components/summary/eosio.reserv';
import rex from '$lib/components/summary/eosio.rex';
import token from '$lib/components/summary/eosio.token';
import greymassnoop from '$lib/components/summary/greymassnoop';
import delphioracle from '$lib/components/summary/delphioracle';
import wram from '$lib/components/summary/eosio.wram';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const summaries: Record<string, any> = {
	'core.vaulta': eosio,
	delphioracle,
	eosio,
	'eosio.reserv': reserv,
	'eosio.rex': rex,
	'eosio.token': token,
	greymassnoop,
	'eosio.wram': wram
};

export const summaryTitles: Record<string, string> = {
	eosio_buyram: m.swap_base_quote({ base: systemtoken.name, quote: ramtoken.name }),
	eosio_buyrambytes: m.swap_base_quote({ base: systemtoken.name, quote: ramtoken.name }),
	eosio_buyrex: m.common_stake_action(),
	eosio_deposit: m.summary_staking_deposit(),
	eosio_logbuyram: m.swap_summary_base_quote({ base: systemtoken.name, quote: ramtoken.name }),
	eosio_logsellram: m.swap_summary_base_quote({ base: ramtoken.name, quote: systemtoken.name }),
	eosio_logramchange: m.common_balance_change(),
	eosio_logsystemfee: m.common_network_fees(),
	eosio_mvfrsavings: m.common_unstake(),
	eosio_powerup: m.common_network_resource_rental(),
	eosio_ramtransfer: m.summary_title_eosiotoken_transfer(),
	eosio_refund: m.common_refund(),
	eosio_sellram: m.swap_base_quote({ base: ramtoken.name, quote: systemtoken.name }),
	eosio_withdraw: m.summary_staking_withdrawal(),
	'eosio.reserv_powupresult': m.common_network_resources_received(),
	'eosio.rex_buyresult': m.common_result(),
	'eosio.token_transfer': m.summary_title_eosiotoken_transfer(),
	'eosio.wram_issue': m.common_contract_processing({ contract: 'WRAM' }),
	'eosio.wram_retire': m.common_contract_processing({ contract: 'WRAM' }),
	'eosio.wram_transfer': m.summary_title_eosiotoken_transfer(),
	greymassnoop_noop: m.summary_title_greymassnoop_noop()
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
