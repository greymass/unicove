<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import { Types } from '$lib/types/rex';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Chip from '$lib/components/chip.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: Types.sellresult;
	}

	const { data }: Props = $props();
</script>

<Chip class="col-start-1 col-end-2 w-full text-center">Staking</Chip>
<AssetElement class="col-start-2 col-end-4" value={Asset.from(data.proceeds)} variant="full" />
