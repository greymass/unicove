<script lang="ts">
	import { page } from '$app/stores';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import { goto } from '$app/navigation';

	const { data, children } = $props();

	const tabOptions = $derived.by(() => {
		const network = String(data.network);
		return [
			{ href: `/${network}/ram`, text: 'Overview' },
			{ href: `/${network}/ram/buy`, text: 'Buy RAM' },
			{ href: `/${network}/ram/sell`, text: 'Sell RAM' }
		];
	});

	let currentTab = $derived($page.url.pathname.split('/').slice(-1)[0]);
	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/').slice(-1)[0] === currentTab
		}))
	);
</script>

<Stack class="gap-6">
	<Stack class="gap-2">
		<h1 class="h1 font-bold leading-none text-white">RAM</h1>
		<h3 class="h3 text-white/60">
			{#if currentTab === 'overview'}
				Overview
			{:else if currentTab === 'buy'}
				Buy RAM
			{:else if currentTab === 'sell'}
				Sell RAM
			{/if}
		</h3>
	</Stack>

	<PillGroup {options} class="mb-6" />

	{@render children()}
</Stack>
