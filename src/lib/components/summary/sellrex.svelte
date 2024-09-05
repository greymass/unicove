<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import type { Asset, Name } from '@wharfkit/antelope';
	import Button from '../button/button.svelte';
	import { Card, Stack, Switcher } from '../layout';

	interface SellREXProps {
		action: {
			data: {
				from: Name;
				amount: Asset;
			};
		};
		class?: string;
		value?: Asset;
	}

	const { action, class: className = '', value, ...props }: SellREXProps = $props();
</script>

<Card class="gap-5 text-center {className}">
	<h3 class="h3">Sell REX</h3>
	<Switcher threshold="20rem">
		<Stack class="gap-0">
			<p class="caption">From</p>
			<p class="h3">{action.data.from}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Rex</p>
			<p class="h3">{action.data.rex}</p>
			{#if value}
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">USD {formatCurrency(value)}</p>
			{/if}
		</Stack>
	</Switcher>
</Card>
