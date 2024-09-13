<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import type { Asset } from '@wharfkit/antelope';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import * as SystemContract from '$lib/wharf/contracts/system';

	interface BuyRAMBytesProps {
		action: {
			data: SystemContract.Types.buyrambytes;
		};
		class?: string;
		value?: Asset;
	}

	const { action, class: className = '', value, ...props }: BuyRAMBytesProps = $props();
</script>

<Card class="gap-5 text-center {className}">
	<h3 class="h3">Buy RAM Bytes</h3>
	<Switcher threshold="20rem">
		<Stack class="gap-0">
			<p class="caption">Payer</p>
			<p class="h3">{action.data.payer}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Receiver</p>
			<p class="h3">{action.data.receiver}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Bytes</p>
			<p class="h3">{action.data.bytes}</p>
			{#if value}
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">USD {formatCurrency(value)}</p>
			{/if}
		</Stack>
	</Switcher>
</Card>
