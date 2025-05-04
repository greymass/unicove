<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import { Types } from '$lib/types/rex';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: Types.deposit;
	}

	const { class: className = '', data, value }: Props = $props();
</script>

<Card class="gap-5 text-center {className}">
	<h3 class="h3">Deposit to REX</h3>
	<Switcher threshold="20rem">
		<Stack class="gap-0">
			<p class="caption">owner</p>
			<p class="h3">{data.owner}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Amount</p>
			<p class="h3">{data.amount}</p>
			{#if value}
				<p class="bg-surface-container-highest mt-1.5 self-start rounded-sm px-2">
					USD {formatCurrency(value)}
				</p>
			{/if}
		</Stack>
	</Switcher>
</Card>
