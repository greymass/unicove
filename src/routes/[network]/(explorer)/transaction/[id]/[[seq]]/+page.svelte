<script lang="ts">
	import { getContext } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import type { ActionDisplayVariants } from '$lib/types.js';
	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import Trace from '$lib/components/elements/trace.svelte';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';

	const context = getContext<UnicoveContext>('state');

	let { data } = $props();

	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);
</script>

Actions ({data.transaction.actions.length})

<SelectActionVariant />

{#each data.transaction.filtered as trace}
	{@const contract = String(trace.action.account)}
	{@const action = String(trace.action.name)}
	{@const summary = getActionSummaryComponent(contract, action)}
	<Trace {trace} {variant} {summary} trxid={false} />
{/each}
