import type { ContractSummaries } from '$lib/types/transaction';
import * as m from '$lib/paraglide/messages';

import transfer from './transfer.svelte';

export default {
	titles: {
		transfer: m.summary_title_eosiotoken_transfer()
	},
	components: {
		transfer
	}
} satisfies ContractSummaries;
