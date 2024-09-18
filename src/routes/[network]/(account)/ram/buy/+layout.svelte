<script lang="ts">
	import { page } from '$app/stores';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	const { data, children } = $props();

	const tabOptions = $derived.by(() => {
		const network = String(data.network);
		return [
			{
				href: `/${network}/ram/buy/tokens`,
				text: String(data.network.chain.systemToken?.symbol.code)
			},
			{ href: `/${network}/ram/buy/bytes`, text: 'Bytes' }
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
	<h2 class="h2 font-bold leading-none text-white">Buy with</h2>
	<PillGroup {options} />

	{@render children()}
</Stack>
