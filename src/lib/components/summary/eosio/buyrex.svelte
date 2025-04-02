<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import { Types } from '$lib/types/rex';
	import type { ActionSummaryProps } from '$lib/types/transaction';

	interface BuyREXProps extends Omit<ActionSummaryProps, 'data'> {
		data: Types.buyrex;
	}

	const { class: className = '', data, value }: BuyREXProps = $props();
</script>

<Card class="gap-5 text-center {className}">
	<h3 class="h3">Buy REX</h3>
	<Switcher threshold="20rem">
		<Stack class="gap-0">
			<p class="caption">From</p>
			<p class="h3">{data.from}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Amount</p>
			<p class="h3">{data.amount}</p>
			{#if value}
				<p class="bg-shark-800/60 mt-1.5 self-start rounded-sm px-2">USD {formatCurrency(value)}</p>
			{/if}
		</Stack>
	</Switcher>
</Card>
