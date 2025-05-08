<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import { Types as RAMTypes } from '$lib/types/ram';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import { ramtoken } from '$lib/wharf/chains';
	import BalanceChange from '$lib/components/summary/components/balancechange.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: RAMTypes.logramchange;
	}

	const { data, ...props }: Props = $props();
</script>

<BalanceChange
	account={data.owner}
	balance={Asset.fromUnits(data.ram_bytes, ramtoken.symbol)}
	delta={Asset.fromUnits(data.bytes, ramtoken.symbol)}
	{...props}
/>
