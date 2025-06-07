import type { ContractSummaries } from '$lib/types/transaction';
import { systemtoken, ramtoken } from '$lib/wharf/chains';
import * as m from '$lib/paraglide/messages';

import buyram from './buyram.svelte';
import buyrambytes from './buyrambytes.svelte';
import buyrex from './buyrex.svelte';
import deposit from './deposit.svelte';
import enforcebal from './enforcebal.svelte';
import giftram from './giftram.svelte';
import logbuyram from './logbuyram.svelte';
import logramchange from './logramchange.svelte';
import logsellram from './logsellram.svelte';
import logsystemfee from './logsystemfee.svelte';
import mvfrsavings from './mvfrsavings.svelte';
import newaccount from './newaccount.svelte';
import powerup from './powerup.svelte';
import ramtransfer from './ramtransfer.svelte';
import refund from './refund.svelte';
import sellram from './sellram.svelte';
import sellrex from './sellrex.svelte';
import setpriv from './setpriv.svelte';
import swaptrace from './swaptrace.svelte';
import withdraw from './withdraw.svelte';

export default {
	titles: {
		buyram: m.swap_base_quote({ base: systemtoken.name, quote: ramtoken.name }),
		buyrambytes: m.swap_base_quote({ base: systemtoken.name, quote: ramtoken.name }),
		buyrex: m.common_stake_action(),
		deposit: m.summary_staking_deposit(),
		giftram: m.summary_title_eosiotoken_transfer(),
		logbuyram: m.swap_summary_base_quote({ base: systemtoken.name, quote: ramtoken.name }),
		logsellram: m.swap_summary_base_quote({ base: ramtoken.name, quote: systemtoken.name }),
		logramchange: m.common_balance_change(),
		logsystemfee: m.common_network_fees(),
		mvfrsavings: m.common_unstake(),
		newaccount: m.common_create_account_direct(),
		powerup: m.common_network_resource_rental(),
		ramtransfer: m.summary_title_eosiotoken_transfer(),
		refund: m.common_refund(),
		sellram: m.swap_base_quote({ base: ramtoken.name, quote: systemtoken.name }),
		swaptrace: m.common_swap(),
		withdraw: m.summary_staking_withdrawal()
	},
	components: {
		buyram,
		buyrambytes,
		buyrex,
		deposit,
		enforcebal,
		giftram,
		logbuyram,
		logramchange,
		logsellram,
		logsystemfee,
		mvfrsavings,
		newaccount,
		powerup,
		ramtransfer,
		refund,
		sellram,
		sellrex,
		setpriv,
		swaptrace,
		withdraw
	}
} satisfies ContractSummaries;
