<script lang="ts">
	import { Asset, Name } from '@wharfkit/session';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import { Types } from '$lib/types/rex';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Chip from '$lib/components/chip.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: Types.mvfrsavings;
	}

	const { data }: Props = $props();
</script>

<Chip class="col-start-1 col-end-2 w-full text-center">Staking</Chip>
<AssetElement class="col-start-2 col-end-4" value={Asset.from(data.rex)} variant="full" />
<AccountElement class="col-start-4 col-end-6" name={Name.from(data.owner)} />
