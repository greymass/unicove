<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	const context = getContext<UnicoveContext>('state');
	import { page } from '$app/stores';
	import UnicoveLogo from '$lib/assets/unicovelogo.svelte';

	const tabOptions = $derived.by(() => {
		const account = String(context.account?.name);
		const network = String(context.account?.network);
		return [
			{ href: `/${network}/account/${account}`, text: 'Account' },
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

<menu
	class=" sticky top-0 grid h-svh max-h-[768px] min-w-36 grid-rows-[56px_1fr_56px] gap-6 px-9 py-4"
>
	<UnicoveLogo wordmark class="" />
	<nav class="flex flex-col justify-center gap-1 text-nowrap text-base font-medium text-white">
		{#if context.account}
			{#each options as option}
				<a
					href={option.href}
					class="flex h-12 items-center transition-opacity hover:opacity-100"
					class:opacity-50={!option.active}
					class:opacity-100={option.active}
					aria-current={option.active}
				>
					<span
						class="border-b-2 py-1"
						class:border-transparent={!option.active}
						class:border-skyBlue-500={option.active}
					>
						{option.text}
					</span>
				</a>
			{/each}
		{/if}
	</nav>
</menu>

<style>
	:root {
		--bg-menu: #00b5ff60;
	}
	menu {
		background-image: radial-gradient(
			circle at left -250% top 50%,
			var(--bg-menu) 40%,
			transparent 80%
		);
	}
</style>
