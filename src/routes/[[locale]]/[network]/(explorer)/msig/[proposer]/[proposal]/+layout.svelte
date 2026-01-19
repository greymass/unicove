<script lang="ts">
	import { Stack } from 'unicove-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const { children, data } = $props();
	const { urlPath } = getContext<UnicoveContext>('state');

	const tabOptions = $derived.by(() => {
		let urlBase = urlPath(`/msig/${data.proposal.proposer}/${data.proposal.name}`);
		return [
			{ href: urlBase, text: 'Status' },
			{ href: `${urlBase}/actions`, text: `Actions (${data.proposal.transaction.actions.length})` },
			{ href: `${urlBase}/transaction`, text: 'Transaction' },
			{ href: `${urlBase}/data`, text: 'Data' }
		];
	});
</script>

<Stack class="@container">
	<PillGroup options={tabOptions} />
	{@render children?.()}
</Stack>
