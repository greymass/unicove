<script lang="ts">
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';

	const { children, data } = $props();

	const tabOptions = $derived.by(() => {
		const account = String(data.contract);
		const network = String(data.network);
		return [
			{ href: `/${network}/contract/${account}`, text: 'Overview' },
			{ href: `/${network}/contract/${account}/actions`, text: 'Actions' },
			{ href: `/${network}/contract/${account}/structs`, text: 'Structs' },
			{ href: `/${network}/contract/${account}/tables`, text: 'Tables' },
			{ href: `/${network}/contract/${account}/abi`, text: 'ABI' }
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

<header class="layout-stack gap-6">
	<Stack class="gap-2">
		<h1 class="h2 leading-none text-neutral-200/60">Contract</h1>
		{#if data.contract}
			<h2 class="h1 font-bold text-white">{data.contract}</h2>
		{/if}
	</Stack>
	<PillGroup {options} class="mb-6" />
</header>

{@render children()}
