import type { ContractSummaries } from '$lib/types/transaction';
import * as m from '$lib/paraglide/messages';

import powupresult from './powupresult.svelte';

export default {
	titles: {
		powupresult: m.common_network_resources_received()
	},
	components: {
		powupresult
	}
} satisfies ContractSummaries;
