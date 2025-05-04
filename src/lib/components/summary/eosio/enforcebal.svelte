<script lang="ts">
	import { Asset, Name } from '@wharfkit/antelope';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Chip from '$lib/components/chip.svelte';

	import { Types } from '$lib/wharf/contracts/core.vaulta';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: Types.enforcebal;
	}

	const { data }: Props = $props();
</script>

<Chip class="col-start-1 col-end-2 w-full text-center">Staking</Chip>
<AssetElement
	class="col-start-2 col-end-4"
	value={Asset.from(data.expected_eos_balance)}
	variant="full"
/>
<AccountElement class="col-start-4 col-end-6" name={Name.from(data.account)} />
