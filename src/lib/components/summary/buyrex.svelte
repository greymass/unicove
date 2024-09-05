<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import type { Asset, Name } from '@wharfkit/antelope';
	import Button from '../button/button.svelte';
	import { Card, Stack, Switcher } from '../layout';

	interface BuyREXProps {
		action: {
			data: {
				from: Name;
				amount: Asset;
			};
		};
		class?: string;
		value?: Asset;
	}

	const { action, class: className = '', value, ...props }: BuyREXProps = $props();
</script>

<Card class="gap-5 text-center {className}">
	<h3 class="h3">Buy REX</h3>
	<Switcher threshold="20rem">
		<Stack class="gap-0">
			<p class="caption">From</p>
			<p class="h3">{action.data.from}</p>
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
