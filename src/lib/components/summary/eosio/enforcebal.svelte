<script lang="ts">
	import { Asset, Name } from '@wharfkit/antelope';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Chip from '$lib/components/chip.svelte';

	import { Types } from '$lib/wharf/contracts/core.vaulta';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: Types.enforcebal;
	}

	const { data }: Props = $props();
</script>

<Row>
	<AssetElement value={Asset.from(data.expected_eos_balance)} variant="full" />
	<AccountElement name={Name.from(data.account)} />
</Row>
