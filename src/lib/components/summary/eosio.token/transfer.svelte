<script lang="ts">
	import * as TokenContract from '$lib/wharf/contracts/token';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import Transfer from '$lib/components/summary/components/transfer.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: TokenContract.Types.transfer;
	}

	const { data, perspectiveOf, ...props }: Props = $props();
</script>

<Transfer
	from={data.from}
	to={data.to}
	quantity={data.quantity}
	memo={data.memo}
	{perspectiveOf}
	{...props}
/>
