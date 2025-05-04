<script lang="ts">
	import { Types } from '$lib/types/ram';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import Transfer from '$lib/components/summary/components/transfer.svelte';
	import { ramtoken } from '$lib/wharf/chains';
	import { Asset } from '@wharfkit/session';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: Types.ramtransfer;
	}

	const { data, perspectiveOf, ...props }: Props = $props();
</script>

<Transfer
	from={data.from}
	to={data.to}
	quantity={Asset.fromUnits(data.bytes, ramtoken.symbol)}
	memo={data.memo}
	{perspectiveOf}
	{...props}
/>
