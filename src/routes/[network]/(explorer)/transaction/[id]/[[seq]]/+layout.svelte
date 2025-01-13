<script lang="ts">
	import { Stack } from '$lib/components/layout/index.js';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { type UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	const { children, data } = $props();

	const { settings } = getContext<UnicoveContext>('state');

	const options = $derived.by(() => {
		let urlBase = `/${data.network}/transaction/${data.id}`;
		if (data.seq) {
			urlBase += `/${data.seq}`;
		}
		return [
			{ href: urlBase, text: m.common_summary() },
			// { href: `${urlBase}/resources`, text: 'Resources' },
			{ href: `${urlBase}/data`, text: m.common_data() }
		];
	});
</script>

<Stack class="@container">
	{#if settings.data.debugMode}
		<PillGroup {options} />
	{/if}

	{@render children()}
</Stack>
