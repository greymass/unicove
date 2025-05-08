<script lang="ts">
	import { Asset, Name } from '@wharfkit/antelope';

	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Chip from '$lib/components/chip.svelte';
	import { Types } from '$lib/types/rex';
	import Row from '../components/row.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: Types.deposit;
	}

	const { data }: Props = $props();
</script>

<Row>
	<Chip>{m.common_staking()}</Chip>
	<AssetElement value={Asset.from(data.amount)} variant="full" />
	<AccountElement name={Name.from(data.owner)} />
</Row>
