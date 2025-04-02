<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import { Types } from '$lib/types/rex';

	interface WithdrawProps extends Omit<ActionSummaryProps, 'data'> {
		data: Types.withdraw;
	}

	const { class: className = '', data, value }: WithdrawProps = $props();
</script>

<Card class="gap-5 text-center {className}">
	<h3 class="h3">Withdraw from REX</h3>
	<Switcher threshold="20rem">
		<Stack class="gap-0">
			<p class="caption">owner</p>
			<p class="h3">{data.owner}</p>
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
