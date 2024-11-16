<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import type { Asset } from '@wharfkit/antelope';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import * as SystemContract from '$lib/wharf/contracts/system';

	interface StakeProps {
		action: {
			data: SystemContract.Types.deposit;
		};
		class?: string;
		value?: Asset;
	}

	const { action, class: className = '', value, ...props }: StakeProps = $props();
</script>

<Card class="gap-5 text-center {className}">
	<h3 class="h3">Deposit to REX</h3>
	<Switcher threshold="20rem">
		<Stack class="gap-0">
			<p class="caption">owner</p>
			<p class="h3">{action.data.owner}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Amount</p>
			<p class="h3">{action.data.amount}</p>
			{#if value}
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">USD {formatCurrency(value)}</p>
			{/if}
		</Stack>
	</Switcher>
</Card>
