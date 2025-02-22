<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';

	interface BuyRAMBytesProps extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.buyrambytes;
	}

	const { class: className = '', data, value }: BuyRAMBytesProps = $props();
</script>

<Card class="gap-5 text-center {className}">
	<h3 class="h3">Buy RAM Bytes</h3>
	<Switcher threshold="20rem">
		<Stack class="gap-0">
			<p class="caption">Payer</p>
			<p class="h3">{data.payer}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Receiver</p>
			<p class="h3">{data.receiver}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Bytes</p>
			<p class="h3">{data.bytes}</p>
			{#if value}
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">USD {formatCurrency(value)}</p>
			{/if}
		</Stack>
	</Switcher>
</Card>
