<script lang="ts">
	import { page } from '$app/stores';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';

	const { data, children } = $props();

	const tabOptions = $derived.by(() => {
		const network = String(data.network);
		return [
			{ href: `/${network}/ram`, text: 'Overview' },
			{ href: `/${network}/ram/buy`, text: 'Buy RAM' },
			{ href: `/${network}/ram/sell`, text: 'Sell RAM' }
		];
	});

	const currentTab = $derived($page.url.pathname.split('/').slice(-1)[0]);
	const options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/').slice(-1)[0] === currentTab
		}))
	);

	const title = $derived.by(() => {
		switch (currentTab) {
			case 'buy':
				return 'Buy RAM';
			case 'sell':
				return 'Sell RAM';
			default:
				return 'Overview';
		}
	});
</script>

<Stack class="gap-6">
	<Pageheader title="RAM" subtitle={title} />

	<PillGroup {options} class="mb-6" />

	{@render children()}
</Stack>
