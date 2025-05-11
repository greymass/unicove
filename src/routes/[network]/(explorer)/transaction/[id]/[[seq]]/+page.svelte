<script lang="ts">
	import { getContext } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import type { ActionDisplayVariants } from '$lib/types.js';
	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import Trace from '$lib/components/elements/trace.svelte';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import TransactionHeader from '$lib/components/transaction/header.svelte';

	import * as m from '$lib/paraglide/messages.js';

	const context = getContext<UnicoveContext>('state');

	let { data } = $props();

	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);
</script>

<Stack class="gap-8">
	<div class="space-y-2">
		<h2 class="h3">{m.common_transaction_details()}</h2>
		<TransactionHeader transaction={data.transaction} />
	</div>

	<div class="space-y-2">
		<h2 class="h3">
			{m.common_transaction_summary()}
		</h2>
		<p class="text-pretty">
			{m.common_transaction_resulting_actions_description()}
		</p>
		<SelectActionVariant />
		<ol class="grid gap-6">
			{#each data.transaction.filtered as trace}
				{@const contract = String(trace.action.account)}
				{@const action = String(trace.action.name)}
				{@const summary = getActionSummaryComponent(contract, action, trace.act.data)}
				<li class="">
					<Trace {trace} {variant} {summary} perspectiveOf={trace.action.authorization[0].actor} />
				</li>
			{/each}
		</ol>
	</div>
</Stack>
