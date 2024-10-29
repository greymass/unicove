<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/stores';

	import UnicoveLogo from '$lib/assets/unicovelogo.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { getSetting } from '$lib/state/settings.svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		callbackFn?: (event: MouseEvent) => void;
		network: NetworkState;
		class?: string;
	}

	let { callbackFn, network, class: className }: Props = $props();

	const advancedMode = getSetting('advanced-mode', false);

	const destinations = $derived.by(() => {
		const isAdvancedMode = advancedMode.value;
		const features = [];

		if (network.supports('staking')) {
			features.push({ href: `/${network}/staking`, text: 'Staking' });
		}

		if (network.supports('rammarket')) {
			features.push({ href: `/${network}/ram`, text: 'RAM' });
		}

		if (isAdvancedMode) {
			features.push({ href: `/${network}/resources`, text: 'Resources' });
		}

		const items = [
			{ href: `/${network}`, text: network.chain.name },
			{ href: `/${network}/send`, text: 'Send' },
			...features,
			{ href: `/${network}/settings`, text: 'Settings' }
		];

		if (context.account) {
			items.splice(1, 0, {
				href: `/${network}/account/${context.account.name}`,
				text: 'Account'
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

<menu class="grid h-svh grid-rows-[auto_1fr] justify-start gap-8 px-8 md:px-0 {className}">
	<UnicoveLogo href="/{network}" wordmark class="flex pt-4 md:hidden" {callbackFn} />
	<nav class="flex flex-col gap-1 text-nowrap text-base font-medium text-white">
		{#each options as option}
			<a
				href={option.href}
				class="flex items-center py-3 leading-snug transition-opacity first:pt-1 hover:opacity-100"
				class:opacity-50={!option.active}
				class:opacity-100={option.active}
				aria-current={!!option.active}
				onclick={callbackFn}
			>
				<span
					class="border-b-2 pb-1"
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
	/* menu { */
	/* 	background-image: radial-gradient( */
	/* 		circle at left -250% top 50%, */
	/* 		var(--bg-menu) 40%, */
	/* 		transparent 80% */
	/* 	); */
	/* } */
</style>
