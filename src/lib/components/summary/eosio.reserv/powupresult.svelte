<script lang="ts">
	import type { ActionSummaryProps } from '$lib/types/transaction';
	import * as m from '$lib/paraglide/messages';
	import Row from '../components/row.svelte';
	import Chip from '$lib/components/chip.svelte';
	import { Int64 } from '@wharfkit/antelope';
	import { ZeroUnits } from '$lib/types/token';
	import type { powupresult } from '$lib/types/powerup';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { browser } from '$app/environment';

	const context = getContext<UnicoveContext>('state');

	interface Props extends Omit<ActionSummaryProps, 'data'> {
		data: powupresult;
	}

	const { data }: Props = $props();
	const resources = $derived(
		browser
			? context.network.getPowerupResources(Number(data.powup_cpu), Number(data.powup_net))
			: { cpu: 0, net: 0 }
	);
</script>

{#if Int64.from(data.powup_cpu).gt(ZeroUnits)}
	<Row>
		<Chip>{m.common_resources()}</Chip>
		{#if browser}
			+ {(resources.cpu / 1000).toFixed(3)} ms (CPU)
		{:else}
			Weight: {data.powup_cpu}
		{/if}
	</Row>
{/if}

{#if Int64.from(data.powup_net).gt(ZeroUnits)}
	<Row>
		<Chip>{m.common_resources()}</Chip>
		{#if browser}
			+ {(resources.net / 1000).toFixed(3)} kb (NET)
		{:else}
			Weight: {data.powup_net}
		{/if}
	</Row>
{/if}
