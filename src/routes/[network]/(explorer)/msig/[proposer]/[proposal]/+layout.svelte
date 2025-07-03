<script lang="ts">
	import {Stack} from 'unicove-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const { children, data } = $props();

	const { settings } = getContext<UnicoveContext>('state');

	const tabOptions = $derived.by(() => {
		let urlBase = `/${data.network}/msig/${data.proposal.proposer}/${data.proposal.name}`;
		return [
			{ href: urlBase, text: 'Overview' },
			{ href: `${urlBase}/data`, text: 'Data' }
		];
	});
</script>

<Stack class="@container">
	{#if settings.data.debugMode}
		<PillGroup options={tabOptions} />
	{/if}

	{@render children()}
</Stack>
