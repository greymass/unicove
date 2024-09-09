<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/stores';

	import UnicoveLogo from '$lib/assets/unicovelogo.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { getSetting } from '$lib/state/settings.svelte';

	const context = getContext<UnicoveContext>('state');

	let advancedMode = getSetting('advanced-mode', false);

	interface Props {
		callbackFn?: (event: MouseEvent) => void;
		network: NetworkState;
		class?: string;
	}

	let { callbackFn, network, class: className }: Props = $props();

	const destinations = $derived.by(() => {
		const isAdvanced = advancedMode.value;

		const items = [
			{ href: `/${network}`, text: network.chain.name },
			{ href: `/${network}/staking`, text: 'Staking' },
			// { href: `/${network}/send`, text: 'Send' },
			{ href: `/${network}/ram`, text: 'RAM' },
			{ href: `/${network}/settings`, text: 'Settings' }
			// { href: `/${network}/move`, text: 'Move' },
			// { href: `/${network}/permissions`, text: 'Permissions' },
			// { href: `/${network}/transactions`, text: 'Transactions' },
			// { href: `/${network}/vote`, text: 'Vote' }
		];

		if (isAdvanced) {
			items.splice(3, 0, { href: `/${network}/resources`, text: 'Resources' });
		}

		if (context.account) {
			items.splice(1, 0, {
				href: `/${network}/account/${context.account.name}`,
				text: context.account.name
			});
		}

		return items;
	});

	let rootPathname = $derived($page.url.pathname.split('/').slice(2)[1]);

	// Derive the active state of each destination
	let options = $derived(
		destinations.map((destination) => ({
			...destination,
			active: rootPathname && destination.href.includes(rootPathname)
		}))
	);
</script>

<menu
	class="sticky top-0 grid h-svh max-h-[768px] min-w-36 grid-rows-[56px_1fr_56px] gap-6 px-9 py-4 {className}"
>
	<UnicoveLogo {network} wordmark class="" {callbackFn} />
	<nav class="flex flex-col justify-center gap-1 text-nowrap text-base font-medium text-white">
		{#each options as option}
			<a
				href={option.href}
				class="flex h-12 items-center transition-opacity hover:opacity-100"
				class:opacity-50={!option.active}
				class:opacity-100={option.active}
				aria-current={!!option.active}
				onclick={callbackFn}
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
	</nav>
</menu>

<style>
	:root {
		--bg-menu: var(--network-theme, #00b5ff60);
	}
	menu {
		background-image: radial-gradient(
			circle at left -250% top 50%,
			var(--bg-menu) 40%,
			transparent 80%
		);
	}
</style>
