<script lang="ts">
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';

	const { children, data } = $props();

	const tabOptions = $derived.by(() => {
		let urlBase = `/${data.network}/transaction/${data.id}`;
		if (data.seq) {
			urlBase += `/${data.seq}`;
		}
		return [
			{ href: urlBase, text: 'Summary' },
			{ href: `${urlBase}/resources`, text: 'Resources' },
			{ href: `${urlBase}/data`, text: 'Chain Data' }
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

<header class="flex flex-wrap justify-between gap-6 pb-10 pt-2">
	<Stack class="gap-1">
		<h1 class="h2 text-neutral-200/60">{data.transaction.id.substring(0, 7)}</h1>
		<h2 class="h1 font-bold text-white">Transaction</h2>
		<h5 class="h5 font-bold text-neutral-200/60">{data.transaction.block_time}</h5>
	</Stack>

	<PillGroup {options} class="sm:self-end" />
</header>

{@render children()}
