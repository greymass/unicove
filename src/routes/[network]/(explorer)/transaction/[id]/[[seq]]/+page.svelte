<script lang="ts">
	import { getContext } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import type { ActionDisplayVariants } from '$lib/types.js';
	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import Trace from '$lib/components/elements/trace.svelte';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';
	import TransactionHeader from '$lib/components/transaction/header.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	const context = getContext<UnicoveContext>('state');

	let { data } = $props();

	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);
</script>

<div class="space-y-2">
	<h2 class="h3">Transaction Details</h2>
	<TransactionHeader transaction={data.transaction} />
</div>

<Stack class="gap-8">
	<div class="space-y-1">
		<h2 class="h3">Resulting Actions ({data.transaction.filtered.length})</h2>
		<p class="text-pretty">
			The actions and inline actions performed as a result of the transaction.
		</p>
	</div>

	<SelectActionVariant />

	<ol class="grid gap-6">
		{#each data.transaction.filtered as trace}
			{@const contract = String(trace.action.account)}
			{@const action = String(trace.action.name)}
			{@const summary = getActionSummaryComponent(contract, action)}
			<li class="">
				<Trace {trace} {variant} {summary} />
			</li>
		{/each}
	</ol>
</Stack>
