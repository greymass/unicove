<script lang="ts">
	import { page } from '$app/stores';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	const { data, children } = $props();

	const tabOptions = $derived.by(() => {
		const network = String(data.network);
		return [
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
		<h3 class="h3 text-white/60">{currentTab === 'buy' ? 'Buy RAM' : 'Sell RAM'}</h3>
	</Stack>

	<PillGroup {options} class="mb-6" />

	{@render children()}
</Stack>
