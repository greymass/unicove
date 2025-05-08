<script lang="ts">
	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import * as m from '$lib/paraglide/messages';
	import AccountElement from '$lib/components/elements/account.svelte';
	import Row from '../components/row.svelte';
	import Chip from '$lib/components/chip.svelte';
	import { Int64, Name } from '@wharfkit/antelope';
	import { ZeroUnits } from '$lib/types/token';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.powerup;
	}

	const { data }: Props = $props();
</script>

{#if Int64.from(data.cpu_frac).gt(ZeroUnits)}
	<Row>
		<Chip>{m.common_resources()}</Chip>
		<AccountElement name={Name.from(data.payer)} />
		{m.common_renting_resources_for({
			resource: 'CPU'
		})}
		<AccountElement name={Name.from(data.receiver)} />
		({data.cpu_frac})
	</Row>
{/if}

{#if Int64.from(data.net_frac).gt(ZeroUnits)}
	<Row>
		<Chip>{m.common_resources()}</Chip>
		<AccountElement name={Name.from(data.payer)} />
		{m.common_renting_resources_for({
			resource: 'NET'
		})}
		<AccountElement name={Name.from(data.receiver)} />
		({data.net_frac})
	</Row>
{/if}
