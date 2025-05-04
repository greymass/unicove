<script lang="ts">
	import * as TokenContract from '$lib/wharf/contracts/token';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import Transfer from '../components/transfer.svelte';

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
