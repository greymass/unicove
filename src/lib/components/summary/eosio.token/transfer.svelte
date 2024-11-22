<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import type { Asset } from '@wharfkit/antelope';
	import { Card, Stack } from '$lib/components/layout';
	import * as TokenContract from '$lib/wharf/contracts/token';
	import { cn } from '$lib/utils';

	interface SendProps {
		action: {
			data: TokenContract.Types.transfer;
		};
		class?: string;
		value?: Asset;
	}

	const { action, value, ...props }: SendProps = $props();
</script>

<Card class={cn('gap-6 text-center @container', props.class)}>
	<h3 class="h3">Token Transfer</h3>
	<div class="flex flex-col justify-evenly gap-2 *:flex-1 @sm:flex-row">
		<Stack class="gap-0">
			<p class="caption">Sender</p>
			<p class="text-nowrap text-xl font-semibold text-white">{action.data.from}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Tokens</p>
			<p class="text-nowrap text-xl font-semibold text-white">{action.data.quantity}</p>
			{#if value}
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">USD {formatCurrency(value)}</p>
			{/if}
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Receiver</p>
			<p class="text-nowrap text-xl font-semibold text-white">{action.data.to}</p>
		</Stack>
	</div>
</Card>
