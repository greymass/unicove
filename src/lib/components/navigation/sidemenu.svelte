<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/stores';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import * as m from '$lib/paraglide/messages';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		callbackFn?: (event: MouseEvent) => void;
		network: NetworkState;
	}

	let { callbackFn, network }: Props = $props();

	// Example: ['', 'en', 'eos', 'staking', 'withdraw']
	let pathname = $derived($page.url.pathname.split('/'));

	const destinations = $derived.by(() => {
		const items = [
			// {
			// 	href: `/${network}`,
			// 	text: network.chain.name,
			// 	active: pathname[2] === String(network) && !pathname[3]
			// },
			{ href: `/${network}/send`, text: m.common_send(), active: pathname[3] === 'send' }
		];

		if (network.supports('staking')) {
			items.push({
				href: `/${network}/staking`,
				text: m.common_staking(),
				active: pathname[3] === 'staking'
			});
		}

		if (network.supports('rammarket')) {
			items.push({ href: `/${network}/ram`, text: 'RAM', active: pathname[3] === 'ram' });
		}

		if (context.settings.data.advancedMode) {
			items.push({
				href: `/${network}/resources`,
				text: m.common_resources(),
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
				text: m.common_my_account(),
				active: pathname[3] === 'account' && pathname[4] === String(context.account.name)
			});
		}

		items.push({
			href: `/${network}/settings`,
			text: m.common_settings(),
			active: pathname[3] === 'settings'
		});

		return items;
	});
</script>

<menu class="text-on-surface flex flex-col gap-2 text-base font-medium text-nowrap">
	{#each destinations as option}
		<a
			href={option.href}
			class="focus-visible:outline-solar-500 flex h-12 items-center rounded-lg leading-snug transition-opacity select-none hover:opacity-100 focus-visible:opacity-100 focus-visible:outline"
			class:opacity-70={!option.active}
			class:opacity-100={option.active}
			aria-current={!!option.active}
			onclick={callbackFn}
		>
			<span
				class="border-b-2 pb-1"
				class:border-transparent={!option.active}
				class:border-primary={option.active}
			>
				{option.text}
			</span>
		</a>
	{/each}
</menu>
