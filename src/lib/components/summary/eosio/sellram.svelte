<script lang="ts">
	import { formatCurrency } from '$lib/i18n';
	import type { Asset } from '@wharfkit/antelope';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import * as SystemContract from '$lib/wharf/contracts/system';

	interface SellRAMProps {
		action: {
			data: SystemContract.Types.sellram;
		};
		class?: string;
		value?: Asset;
	}

	const { action, class: className = '', value, ...props }: SellRAMProps = $props();
</script>

<Card class="gap-5 text-center {className}">
	<h3 class="h3">Sell RAM</h3>
	<Switcher threshold="20rem">
		<Stack class="gap-0">
			<p class="caption">Account</p>
			<p class="h3">{action.data.account}</p>
		</Stack>
		<Stack class="gap-0">
			<p class="caption">Bytes</p>
			<p class="h3">{action.data.bytes}</p>
			{#if value}
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">USD {formatCurrency(value)}</p>
			{/if}
		</Stack>
	</Switcher>
</Card>
