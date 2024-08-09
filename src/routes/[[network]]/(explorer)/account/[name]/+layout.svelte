<script lang="ts">
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';

	const { children, data } = $props();

	const tabOptions = $derived.by(() => {
		const account = String(data.account.name);
		const network = String(data.account.network);
		return [
			{ href: `/${network}/account/${account}`, text: 'Overview' },
			{ href: `/${network}/account/${account}/resources`, text: 'Resources' },
			{ href: `/${network}/account/${account}/activity`, text: 'Activity' },
			{ href: `/${network}/account/${account}/chaindata`, text: 'Chain Data' }
		];
	});

	let currentTab = $derived($page.url.pathname.split('/').slice(2)[1]);

	// Derive the active state of each destination
	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/')[2] === currentTab
		}))
	);
</script>

<header class="flex flex-wrap justify-between gap-6 pb-10 pt-2">
	<Stack class="gap-1">
		<h1 class="h2 text-neutral-200/60">Account</h1>
		{#if data.account}
			<h2 class="h1 font-bold text-white">{data.account.name}</h2>
		{/if}
	</Stack>

	<PillGroup {options} class="sm:self-end" />
</header>

{@render children()}
