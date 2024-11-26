<script lang="ts">
	import { onMount, setContext, untrack } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Checksum256, type NameType } from '@wharfkit/antelope';
	import MobileNavigation from '$lib/components/navigation/mobilenavigation.svelte';
	import SideMenuContent from '$lib/components/navigation/sidemenu.svelte';
	import AccountSwitcher from '$lib/components/accountswitch.svelte';
	import UnicoveLogo from '$lib/assets/unicovelogo.svelte';
	import Search from '$lib/components/search/input.svelte';
	import X from 'lucide-svelte/icons/circle-x';
	import { chainLogos } from '@wharfkit/common';
	import { AccountState } from '$lib/state/client/account.svelte.js';
	import { WharfState } from '$lib/state/client/wharf.svelte.js';
	import { NetworkState, getNetwork } from '$lib/state/network.svelte.js';

	let { children, data } = $props();

	let account: AccountState | undefined = $state();
	const wharf = new WharfState();

	setContext<UnicoveContext>('state', {
		get account() {
			return account;
		},
		get network() {
			return data.network;
		},
		get wharf() {
			return wharf;
		}
	});

	export function setAccount(
		state: NetworkState,
		name: NameType,
		fetchOverride?: typeof fetch
	): AccountState {
		account = new AccountState(data.network, name, fetchOverride);
		account.refresh();
		return account;
	}

	$effect(() => {
		const { session } = wharf;
		untrack(() => {
			if (session) {
				setAccount(getNetwork(session.chain), session.actor);
			} else {
				account = undefined;
			}
		});
	});

	async function setupWharf() {
		if (!wharf.sessionKit) {
			wharf.init();
		}

		const sessions = await wharf.sessionKit?.getSessions();
		if (sessions) {
			const lastUsedSession = wharf.chainsSession[String(data.network.chain.id)];
			const anyValidSession =
				sessions.length > 0
					? sessions.find((s) => Checksum256.from(s.chain).equals(data.network.chain.id))
					: undefined;
			if (lastUsedSession) {
				wharf.restore(lastUsedSession);
			} else if (anyValidSession) {
				wharf.restore(anyValidSession);
			} else {
				wharf.reset();
			}
		}
	}

	$effect(() => {
		const { network } = data; // Destructure to force reactivity
		if (!account) {
			// no account loaded
			setupWharf();
		} else if (account && !account.network.chain.equals(network.chain)) {
			// account loaded but for a different network
			setupWharf();
		}
	});

	// Number of ms between network updates
	const ACCOUNT_UPDATE_INTERVAL = 3_000;
	const NETWORK_UPDATE_INTERVAL = 3_000;

	// Default to not show a banner (avoids flash of banner when hidden)
	let showBanner = $state(false);

	onMount(() => {
		// Update account state on a set interval
		const accountInterval = setInterval(() => {
			if (account) {
				account.refresh();
			}
		}, ACCOUNT_UPDATE_INTERVAL);

		// Update the network state on a set interval
		const networkInterval = setInterval(() => {
			data.network.refresh();
		}, NETWORK_UPDATE_INTERVAL);

		// Show the banner if localStorage has no flag set
		showBanner = !localStorage.getItem('hide-v1-banner');

		return () => {
			clearInterval(accountInterval);
			clearInterval(networkInterval);
		};
	});

	function hideBanner() {
		// update the store to immediately hide the banner
		showBanner = false;
		// set the flag to prevent banner showing on next load
		localStorage.setItem('hide-v1-banner', 'true');
	}

	// Deduplicate chain logos
	let logoSet = Array.from(new Set(chainLogos.values())).map(String);
</script>

<!-- Preload current chain logo, prefetch the rest to avoid future pop-in -->
<svelte:head>
	{#each logoSet as logoSrc}
		{#if logoSrc === chainLogos.get(String(data.network.chain.id))}
			<link rel="preload" href={logoSrc} as="image" type="image/png" />
		{:else}
			<link rel="prefetch" href={logoSrc} as="image" type="image/png" />
		{/if}
	{/each}
</svelte:head>

{#if showBanner}
	<aside
		class="grid grid-cols-[auto_1fr_auto] items-center justify-items-center gap-4 bg-mineShaft-950 shadow *:row-start-1"
	>
		<p
			class="col-start-2 py-4 font-medium text-mineShaft-50 md:col-span-3 md:col-start-1 md:text-center"
		>
			Looking for the old version of Unicove? Go to
			<a class="underline" href="https://v1.unicove.com">v1.unicove.com</a>
		</p>
		<button
			class="col-start-3 grid size-12 place-items-center justify-self-end text-inherit"
			onclick={hideBanner}
		>
			<X class="size-4 " />
		</button>
	</aside>
{/if}

<div
	class="
	relative
	mx-auto
	grid
	h-full
	min-h-svh
	w-[calc(100%-2rem)]
	max-w-screen-2xl
	grid-cols-2
	grid-rows-[min-content_minmax(0,1fr)]
	gap-y-6
	pb-12
	pt-4
	sm:grid-cols-4
	md:h-auto
	md:min-h-svh
	md:grid-cols-12
	md:grid-rows-[min-content_minmax(0,1fr)]
	md:gap-x-4
	"
>
	<header class="col-span-full flex h-12 items-center justify-between">
		<!-- Larger breakpoints only	 -->
		<a
			href="/{data.network}"
			class="hidden w-min place-self-center rounded-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-solar-500 md:block"
		>
			<UnicoveLogo small />
		</a>

		<MobileNavigation network={data.network} />

		<div
			class="flex items-center justify-end gap-4 sm:col-start-4 md:col-span-full md:col-start-9 md:flex-1 md:gap-4"
		>
			<Search network={data.network} class="max-w-56 flex-1" />

			<AccountSwitcher network={data.network} class="" />
		</div>
	</header>

	<aside class="relative row-start-2 hidden h-full md:block">
		<SideMenuContent class="" network={data.network} />
	</aside>

	<main
		class="col-span-full col-start-1 row-start-2 grid grid-cols-subgrid content-start gap-x-4 *:col-span-full md:col-start-3 md:col-end-13 md:px-0 lg:col-end-12"
	>
		{@render children()}
	</main>
</div>
