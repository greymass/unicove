import type { ContractSummaries } from '$lib/types/transaction';
import * as m from '$lib/paraglide/messages';

import issue from './issue.svelte';
import retire from './retire.svelte';

export default {
	titles: {
		issue: m.common_contract_processing({ contract: 'WRAM' }),
		retire: m.common_contract_processing({ contract: 'WRAM' }),
		transfer: m.summary_title_eosiotoken_transfer()
	},
	components: {
		issue,
		retire
	}
} satisfies ContractSummaries;
