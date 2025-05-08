<script lang="ts">
	import { Name } from '@wharfkit/antelope';

	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountElement from '$lib/components/elements/account.svelte';
	import Row from '../components/row.svelte';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.setpriv;
	}

	const { data }: Props = $props();
</script>

<Row>
	<AccountElement name={Name.from(data.account)} /> = {data.is_priv ? 'true' : 'false'}
</Row>
