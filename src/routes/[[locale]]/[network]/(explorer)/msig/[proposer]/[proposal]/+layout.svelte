<script lang="ts">
	import { Stack } from 'unicove-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const { children, data } = $props();
	const context = getContext<UnicoveContext>('state');

	const tabOptions = $derived.by(() => {
		let urlBase = context.urlPath(`/msig/${data.proposal.proposer}/${data.proposal.name}`);
		const tabs = [
			{ href: urlBase, text: 'Status' },
			{ href: `${urlBase}/actions`, text: `Actions (${data.proposal.transaction.actions.length})` },
			{ href: `${urlBase}/transaction`, text: 'Transaction' },
			{ href: `${urlBase}/data`, text: 'Data' }
		];
		if (context.network.supports('sentiment')) {
			tabs.push({ href: `${urlBase}/sentiment`, text: 'Sentiment' });
		}
		return tabs;
	});
</script>

<Stack class="@container">
	<PillGroup options={tabOptions} />
	{@render children?.()}
</Stack>
