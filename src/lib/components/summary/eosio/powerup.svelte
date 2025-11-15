<script lang="ts">
	import * as SystemContract from '$lib/wharf/contracts/system';
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import AccountElement from '$lib/components/elements/account.svelte';
	import Row from '../components/row.svelte';
	import { Chip } from 'unicove-components';
	import { Int64, Name } from '@wharfkit/antelope';
	import { ZeroUnits } from '$lib/types/token';

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: SystemContract.Types.powerup;
	}

	const { data }: Props = $props();
</script>

{#if Int64.from(data.cpu_frac).gt(ZeroUnits)}
	<Row>
		<Chip>Resources</Chip>

		<div>
			<AccountElement name={Name.from(data.payer)} />
			<span class="text-nowrap">renting CPU for</span>
			<AccountElement name={Name.from(data.receiver)} />
		</div>

		<div>
			<span class="text-nowrap">
				({data.cpu_frac})
			</span>
		</div>
	</Row>
{/if}

{#if Int64.from(data.net_frac).gt(ZeroUnits)}
	<Row>
		<Chip>Resources</Chip>

		<div>
			<AccountElement name={Name.from(data.payer)} />
			<span class="text-nowrap">renting NET for</span>
			<AccountElement name={Name.from(data.receiver)} />
		</div>

		<span class="text-nowrap">
			({data.net_frac})
		</span>
	</Row>
{/if}
