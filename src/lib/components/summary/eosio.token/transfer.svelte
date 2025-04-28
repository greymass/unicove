<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import { Card } from '$lib/components/layout';
	import * as TokenContract from '$lib/wharf/contracts/token';
	import { cn } from '$lib/utils';
	import type { ActionSummaryProps } from '$lib/types/transaction';

	interface SendProps extends Omit<ActionSummaryProps, 'data'> {
		data: TokenContract.Types.transfer;
	}

	const { data, value, ...props }: SendProps = $props();
</script>

<div class="flex justify-center">
	<Card
		class={cn(
			' bg-surface-container-high @container w-full max-w-2xl gap-4 text-center',
			props.class
		)}
	>
		<span class="text-xl font-semibold">Token Transfer</span>
		<hr class="text-outline-variant" />
		<div class="grid gap-4 @md:grid-cols-3">
			<div>
				<p>Sender</p>
				<p class="text-on-surface text-xl font-semibold text-nowrap">{data.from}</p>
			</div>
			<div>
				<p>Tokens</p>
				<p class="text-on-surface text-xl font-semibold text-nowrap">{data.quantity}</p>
				{#if value}
					<p class="bg-surface-container-highest mt-1.5 self-start rounded-sm px-2">
						USD {formatCurrency(value)}
					</p>
				{/if}
			</div>
			<div>
				<p>Receiver</p>
				<p class="text-on-surface text-xl font-semibold text-nowrap">{data.to}</p>
			</div>
		</div>
	</Card>
</div>
