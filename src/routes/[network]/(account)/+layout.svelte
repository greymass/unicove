<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { Stack } from '$lib/components/layout';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';

	const { children } = $props();
	const context = getContext<UnicoveContext>('state');

	const tabOptions = $derived.by(() => {
		const account = String(context.account?.name);
		const network = String(context.account?.network);
		return [
			{ href: `/${network}/account/${account}`, text: 'Overview' },
			{ href: `/${network}/account/${account}/activity`, text: 'Activity' },
			{ href: `/${network}/account/${account}/balances`, text: 'Balances' },
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

<header class="layout-stack gap-6">
	<Stack class="gap-2">
		<h1 class="h2 leading-none text-white/60">Account</h1>
		{#if context.account}
			<h2 class="h1 font-bold text-white">{context.account.name}</h2>
		{/if}
	</Stack>
	<PillGroup {options} class="mb-6" />
</header>

{@render children()}
