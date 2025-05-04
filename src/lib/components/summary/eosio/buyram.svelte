<script lang="ts">
	import { Asset, Name } from '@wharfkit/antelope';

	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Chip from '$lib/components/chip.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.buyram;
	}

	const { data }: Props = $props();
</script>

<Chip class="col-start-1 col-end-2 w-full text-center">Action</Chip>
<AssetElement class="col-start-2 col-end-4" value={Asset.from(data.quant)} variant="full" />
<AccountElement class="col-start-4 col-end-6" name={Name.from(data.payer)} />
{#if !Name.from(data.receiver).equals(data.payer)}
	<span class="col-start-6 col-end-12">
		(Receiver:
		<AccountElement name={Name.from(data.receiver)} />)
	</span>
{/if}
