<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';

	interface WithdrawProps extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.withdraw;
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
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">USD {formatCurrency(value)}</p>
			{/if}
		</Stack>
	</Switcher>
</Card>
