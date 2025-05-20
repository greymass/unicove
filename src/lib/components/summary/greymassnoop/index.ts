import type { ContractSummaries } from '$lib/types/transaction';
import * as m from '$lib/paraglide/messages';

import noop from './noop.svelte';

export default {
	titles: {
		noop: m.summary_title_greymassnoop_noop()
	},
	components: {
		noop
	}
} satisfies ContractSummaries;
