<script lang="ts">
	import Trace from '$lib/components/elements/trace.svelte';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';
	import type { ActionDisplayVariants } from '$lib/types.js';

	// Contract action summary components
	import eosio from '$lib/components/summary/eosio/index.js';
	import token from '$lib/components/summary/eosio.token/index.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');

	// Mapping contract names to their action summary components
	const summaries: Record<string, any> = {
		eosio,
		'eosio.token': token
	};

	let { data } = $props();

	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);
</script>

Actions ({data.transaction.actions.length})

<SelectActionVariant />

{#each data.transaction.filtered as trace}
	{@const contract = String(trace.action.account)}
	{@const action = String(trace.action.name)}
	{@const summary = (summaries[contract] && summaries[contract][action]) || null}
	<Trace {trace} {variant} {summary} />
{/each}
