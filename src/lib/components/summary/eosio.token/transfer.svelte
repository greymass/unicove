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
			'bg-shark-950  bg-mine-900/30 @container w-full max-w-2xl gap-4 text-center',
			props.class
		)}
	>
		<span class="text-xl font-semibold">Token Transfer</span>
		<hr class="text-zinc-400/10" />
		<div class="grid gap-4 @md:grid-cols-3">
			<div>
				<p>Sender</p>
				<p class="text-xl font-semibold text-nowrap text-white">{data.from}</p>
			</div>
			<div>
				<p>Tokens</p>
				<p class="text-xl font-semibold text-nowrap text-white">{data.quantity}</p>
				{#if value}
					<p class="bg-shark-800/60 mt-1.5 self-start rounded-sm px-2">
						USD {formatCurrency(value)}
					</p>
				{/if}
			</div>
			<div>
				<p>Receiver</p>
				<p class="text-xl font-semibold text-nowrap text-white">{data.to}</p>
			</div>
		</div>
	</Card>
</div>
