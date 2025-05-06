<script lang="ts">
	import { Asset, Name } from '@wharfkit/antelope';

	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Chip from '$lib/components/chip.svelte';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.buyram;
	}

	const { data }: Props = $props();
</script>

<Row>
	<Chip>Action</Chip>
	<AssetElement value={Asset.from(data.quant)} variant="full" />
	<AccountElement name={Name.from(data.payer)} />
	{#if !Name.from(data.receiver).equals(data.payer)}
		<span>
			(Receiver:
			<AccountElement name={Name.from(data.receiver)} />)
		</span>
	{/if}
</Row>
