<script lang="ts">
	import { page } from '$app/stores';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	const { data, children } = $props();

	const tabOptions = $derived.by(() => {
		const network = String(data.network);
		return [
			{ href: `/${network}/ram`, text: 'Overview' },
			{ href: `/${network}/ram/buy/tokens`, text: 'Buy RAM' },
			{ href: `/${network}/ram/sell/tokens`, text: 'Sell RAM' }
		];
	});

	let currentTab = $derived($page.url.pathname.split('/')[4] || 'overview');

	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active:
				`/${$page.url.pathname.split('/').slice(2).slice(0, -1).join('/')}` ===
				option.href.split('/').slice(0, -1).join('/')
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
