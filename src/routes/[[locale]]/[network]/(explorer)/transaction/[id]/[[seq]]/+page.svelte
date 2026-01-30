<script lang="ts">
	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import Trace from '$lib/components/elements/trace.svelte';
	import { Stack } from 'unicove-components';

	let { data } = $props();
</script>

<Stack class="gap-8">
	<div class="space-y-2">
		<h2 class="text-title">Transaction Summary</h2>
		<p class="text-pretty">
			The actions and inline actions performed as a result of the transaction.
		</p>
		<ol class="grid gap-6">
			{#each data.transaction.filtered as trace}
				{@const contract = String(trace.action.account)}
				{@const action = String(trace.action.name)}
				{@const firstAuthorization = trace.action.authorization[0]
					? trace.action.authorization[0].actor
					: undefined}
				{@const summary = getActionSummaryComponent(contract, action, trace.act.data)}
				<li class="">
					<Trace date {trace} variant="summary" {summary} perspectiveOf={firstAuthorization} />
				</li>
			{/each}
		</ol>
	</div>
</Stack>
