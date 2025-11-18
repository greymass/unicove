<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import DebugToggle from '$lib/components/select/debug.svelte';
	import { CodeIcon, MoonIcon } from '@lucide/svelte';
	import SchemeToggle from '$lib/components/select/scheme.svelte';
	import LanguageSelect from '$lib/components/select/language.svelte';

	const context = getContext<UnicoveContext>('state');
	const { urlPath } = context;

	interface Props {
		callbackFn?: (event: MouseEvent) => void;
		network: NetworkState;
	}

	let { callbackFn, network }: Props = $props();

	// Example: ['', 'en', 'eos', 'staking', 'withdraw']
	let pathname = $derived(page.url.pathname.split('/'));

	const isCurrentAccountActive = $derived(
		pathname[3] === 'account' && pathname[4] === String(context.account?.name)
	);

	const destinations = $derived.by(() => {
		const items = [
			{
				href: urlPath(`/explore`),
				text: 'Explore',
				active:
					[
						'explore',
						'key',
						'account',
						'block',
						'contract',
						'msig',
						'network',
						'producers',
						'prompt',
						'token',
						'transaction'
					].includes(pathname[3]) && !isCurrentAccountActive
			},
			{ href: urlPath(`/send`), text: 'Send', active: pathname[3] === 'send' }
		];

		if (network.supports('staking')) {
			items.push({
				href: urlPath(`/staking`),
				text: 'Staking',
				active: pathname[3] === 'staking'
			});
		}

		if (network.supports('rammarket')) {
			items.push({ href: urlPath(`/ram`), text: 'RAM', active: pathname[3] === 'ram' });
		}

		if (context.settings.data.advancedMode) {
			items.push({
				href: urlPath(`/resources`),
				text: 'Resources',
				active: pathname[3] === 'resources'
			});
		}

		if (context.settings.data.debugMode) {
			items.push({
				href: urlPath(`/debug/state`),
				text: 'Debug State',
				active: pathname[3] === 'debug'
			});
		}

		if (context.account) {
			items.splice(0, 0, {
				href: urlPath(`/account/${context.account.name}`),
				text: 'My Account',
				active: isCurrentAccountActive
			});
		}

		items.push({
			href: urlPath(`/settings`),
			text: 'Settings',
			active: pathname[3] === 'settings'
		});

		return items;
	});
</script>

<menu id="side-menu" class="flex flex-1 flex-col gap-2 text-base font-medium text-nowrap">
	{#each destinations as option}
		<a
			href={option.href}
			class="focus-visible:outline-solar-500 hover:text-on-surface flex h-12 items-center rounded-lg leading-snug select-none focus-visible:opacity-100 focus-visible:outline"
			class:text-on-surface-variant={!option.active}
			class:text-on-surface={option.active}
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

	{#if context.settings.data.developerMode}
		<div class="mt-auto grid gap-4 pb-4">
			<span class="flex items-center gap-2">
				<CodeIcon />
				<DebugToggle />
			</span>
			<span class="flex items-center gap-2">
				<MoonIcon />
				<SchemeToggle />
			</span>
			<span class="flex items-center gap-2">
				<LanguageSelect />
			</span>
		</div>
	{/if}
</menu>
