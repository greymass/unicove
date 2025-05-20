import type { ContractSummaries } from '$lib/types/transaction';
import * as m from '$lib/paraglide/messages';

import write from './write.svelte';

export default {
	titles: {
		write: m.delphioracle_write()
	},
	components: {
		write
	}
} satisfies ContractSummaries;
