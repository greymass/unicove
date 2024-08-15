<script lang="ts">
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';

	const { children, data } = $props();

	/**
	 * 1. Overview
	 * 2. Activity
	 * 3. Assets
	 *  - RAM
	 *  - Staked
	 *  - Tokens
	 * 4. Details (?? Unsure on name, it's basically the state of the account)
	 *  - Permissions
	 *  - Resources
	 * 5. Data (Maybe this is just an icon? Something obscure, as its not a common use case)
	 */
	const tabOptions = $derived.by(() => {
		const account = String(data.account.name);
		const network = String(data.account.network);
		return [
			{ href: `/${network}/account/${account}`, text: 'Overview' },
			{ href: `/${network}/account/${account}/activity`, text: 'Activity' },
			{ href: `/${network}/account/${account}/assets`, text: 'Assets' },
			{ href: `/${network}/account/${account}/permissions`, text: 'Permissions' },
			{ href: `/${network}/account/${account}/ram`, text: 'RAM' },
			{ href: `/${network}/account/${account}/resources`, text: 'Resources' },
			{ href: `/${network}/account/${account}/staked`, text: 'Staked' },
			{ href: `/${network}/account/${account}/chaindata`, text: 'Chain Data' }
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
		<h1 class="h2 text-neutral-200/60">Account</h1>
		{#if data.account}
			<h2 class="h1 font-bold text-white">{data.account.name}</h2>
		{/if}
	</Stack>

	<PillGroup {options} class="sm:self-end" />
</header>

{@render children()}
