<script lang="ts">
	import { Asset, Name } from '@wharfkit/antelope';

	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import { ramtoken } from '$lib/wharf/chains';
	import AccountElement from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.sellram;
	}

	const { data }: Props = $props();
</script>

<Row>
	<AssetElement value={Asset.fromUnits(data.bytes, ramtoken.symbol)} variant="full" />
	<AccountElement name={Name.from(data.account)} />
</Row>
