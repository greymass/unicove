<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/stores';

	import UnicoveLogo from '$lib/assets/unicovelogo.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		callbackFn?: (event: MouseEvent) => void;
		network: NetworkState;
		class?: string;
	}

	let { callbackFn, network, class: className }: Props = $props();

	// Example: ['', 'en', 'eos', 'staking', 'withdraw']
	let pathname = $derived($page.url.pathname.split('/'));

	const destinations = $derived.by(() => {
		const items = [
			// {
			// 	href: `/${network}`,
			// 	text: network.chain.name,
			// 	active: pathname[2] === String(network) && !pathname[3]
			// },
			{ href: `/${network}/send`, text: 'Send', active: pathname[3] === 'send' }
		];

		if (network.supports('staking')) {
			items.push({
				href: `/${network}/staking`,
				text: 'Staking',
				active: pathname[3] === 'staking'
			});
		}

		if (network.supports('rammarket')) {
			items.push({ href: `/${network}/ram`, text: 'RAM', active: pathname[3] === 'ram' });
		}

		if (context.settings.data.advancedMode) {
			items.push({
				href: `/${network}/resources`,
				text: 'Resources',
				active: pathname[3] === 'resources'
			});
		}

		if (context.settings.data.debugMode) {
			items.push({
				href: `/${network}/debug/state`,
				text: 'Debug State',
				active: pathname[3] === 'debug'
			});
		}

		if (context.account) {
			items.splice(0, 0, {
				href: `/${network}/account/${context.account.name}`,
				text: 'My Account',
				active: pathname[3] === 'account' && pathname[4] === String(context.account.name)
			});
		}

		items.push({
			href: `/${network}/settings`,
			text: 'Settings',
			active: pathname[3] === 'settings'
		});

		return items;
	});
</script>

<menu class="grid h-svh grid-rows-[auto_1fr] justify-start gap-8 px-8 md:px-0 {className}">
	<a href="/{network}" onclick={callbackFn} class="flex pt-4 md:hidden">
		<UnicoveLogo wordmark class="fill-shark-100" />
	</a>

	<nav class="flex flex-col gap-2 text-nowrap text-base font-medium text-white">
		{#each destinations as option}
			<a
				href={option.href}
				class="flex h-12 select-none items-center rounded-lg leading-snug transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-solar-500"
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
