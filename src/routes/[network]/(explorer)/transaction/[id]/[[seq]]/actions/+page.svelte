<script lang="ts">
	import { getContext } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import type { ActionDisplayVariants } from '$lib/types.js';
	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';
	import ActionElement from '$lib/components/elements/action.svelte';

	const context = getContext<UnicoveContext>('state');

	let { data } = $props();

	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);
</script>

<div class="p-2">
	<h2 class="h2 text-2xl">Actions ({data.transaction.transaction.actions.length})</h2>
	<p>The actions performed in the transaction, without the inline actions.</p>
</div>

<SelectActionVariant />

{#each data.transaction.transaction.actions as action}
	{@const contract = String(action.account)}
	{@const name = String(action.name)}
	{@const summary = getActionSummaryComponent(contract, name)}
	{#await context.network.objectifyAction(action) then objectified}
		<ActionElement {action} {objectified} {variant} {summary} />
	{/await}
{/each}
