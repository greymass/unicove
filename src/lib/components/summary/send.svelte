<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import type { Asset, Name } from '@wharfkit/antelope';
	import Button from '../button/button.svelte';
	import { Card, Stack, Switcher } from '../layout';

	interface SendProps {
		action: {
			data: {
				from: Name;
				to: Name;
				quantity: Asset;
				memo: string;
			};
		};
		class?: string;
		value?: Asset;
	}

	const { action, class: className = '', value, ...props }: SendProps = $props();
</script>

<Card class="gap-5 text-center {className}">
	<h3 class="h3">Token Transfer</h3>
	<Switcher threshold="20rem">
		<Stack class="gap-0">
			<p class="caption">Sender</p>
			<p class="h3">{action.data.from}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Tokens</p>
			<p class="h3">{action.data.quantity}</p>
			{#if value}
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">USD {formatCurrency(value)}</p>
			{/if}
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Receiver</p>
			<p class="h3">{action.data.to}</p>
		</Stack>
	</Switcher>
</Card>
