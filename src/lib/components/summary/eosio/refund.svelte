<script lang="ts">
	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import * as m from '$lib/paraglide/messages';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.refund;
	}

	const { data }: Props = $props();
</script>

{m.summary_eosio_refund({
	account: data.owner
})}
