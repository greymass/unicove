<script lang="ts">
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout/index.js';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const { children, data } = $props();

	const { settings } = getContext<UnicoveContext>('state');

	const tabOptions = $derived.by(() => {
		let urlBase = `/${data.network}/block/${data.number}`;
		return [
			{ href: urlBase, text: 'Summary' },
			{ href: `${urlBase}/data`, text: 'Data' }
		];
	});

	let currentTab = $derived($page.url.pathname.split('/').slice(2)[3]);

	// Derive the active state of each destination
	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/').slice(2)[2] === currentTab
		}))
	);
</script>

<Stack class="@container">
	{#if settings.data.debugMode}
		<PillGroup {options} />
	{/if}

	{@render children()}
</Stack>
