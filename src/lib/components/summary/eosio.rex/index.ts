import type { ContractSummaries } from '$lib/types/transaction';
import * as m from '$lib/paraglide/messages';

import buyresult from './buyresult.svelte';
import sellresult from './sellresult.svelte';

export default {
	titles: {
		buyresult: m.common_result(),
		sellresult: m.common_result()
	},
	components: {
		buyresult,
		sellresult
	}
} satisfies ContractSummaries;
