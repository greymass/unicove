<script lang="ts">
	import { Asset, Name } from '@wharfkit/antelope';

	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Row from '../components/row.svelte';
	import { systemtoken } from '$lib/wharf/chains';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.buyram;
	}

	const { data }: Props = $props();
	const quant = $derived.by(() => {
		try {
			return Asset.from(data.quant);
		} catch {
			try {
				return Asset.fromFloat(Number(data.quant), systemtoken.symbol);
			} catch (error) {
				console.error('Error parsing quant:', error);
			}
		}
		return Asset.fromUnits(0, systemtoken.symbol);
	});
</script>

<Row>
	<AssetElement value={quant} variant="full" />
	<AccountElement name={Name.from(data.payer)} />
	{#if !Name.from(data.receiver).equals(data.payer)}
		<span>
			(Receiver:
			<AccountElement name={Name.from(data.receiver)} />)
		</span>
	{/if}
</Row>
