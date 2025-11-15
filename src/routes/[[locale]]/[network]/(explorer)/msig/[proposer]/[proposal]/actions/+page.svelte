<script lang="ts">
	import { getContext } from 'svelte';

	import { Button } from 'unicove-components';
	import { DD, DL, DLRow } from 'unicove-components';
	import { Stack, Switcher } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import Account from '$lib/components/elements/account.svelte';
	import ActionCard from '$lib/components/elements/action.svelte';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';

	import { ApprovalManager } from '../manager.svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import { getActionSummaryComponent } from '$lib/components/summary';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let context = getContext<UnicoveContext>('state');

	const manager = $state(new ApprovalManager(context, data.proposal));
	$effect(() => {
		manager.sync(data.network, context.wharf);
	});

	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);
</script>

<Stack class="mt-6">
	<Stack>
		<h2 class="text-title">Proposed Actions ({variant})</h2>
		<SelectActionVariant />
		{#each manager.readable as decodedAction}
			{@const contract = String(decodedAction.action.account)}
			{@const action = String(decodedAction.action.name)}
			{@const summary = getActionSummaryComponent(contract, action, decodedAction.action.data)}
			<ActionCard
				action={decodedAction.action}
				objectified={decodedAction.readable?.data}
				{summary}
				{variant}
			/>
		{/each}
	</Stack>
</Stack>
