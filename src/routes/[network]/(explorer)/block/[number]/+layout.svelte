<script lang="ts">
	import {Stack} from 'unicove-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const { children, data } = $props();

	const { settings } = getContext<UnicoveContext>('state');

	const options = $derived.by(() => {
		let urlBase = `/${data.network}/block/${data.number}`;
		return [
			{ href: urlBase, text: 'Summary' },
			{ href: `${urlBase}/data`, text: 'Data' }
		];
	});
</script>

<Stack class="@container">
	{#if settings.data.debugMode}
		<PillGroup {options} />
	{/if}

	{@render children()}
</Stack>
