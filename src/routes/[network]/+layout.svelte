<script lang="ts">
	import { Checksum256, type NameType } from '@wharfkit/antelope';
	import { chainLogos } from '@wharfkit/common';
	import { onMount, setContext, untrack } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import extend from 'just-extend';

	import X from 'lucide-svelte/icons/circle-x';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/state';

	import { AccountState } from '$lib/state/client/account.svelte.js';
	import { AccountValueState, NetworkValueState } from '$lib/state/value.svelte.js';
	import { MarketState } from '$lib/state/market.svelte.js';
	import { SearchRecordStorage } from '$lib/state/search.svelte.js';
	import { SettingsState } from '$lib/state/settings.svelte.js';
	import { WharfState } from '$lib/state/client/wharf.svelte.js';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';

	import AccountSwitcher from '$lib/components/accountswitch.svelte';
	import Search from '$lib/components/search/input.svelte';
	import SideMenuContent from '$lib/components/navigation/sidemenu.svelte';
	import Unicovelogo from '$lib/assets/unicovelogo.svelte';
	import MobileNavigation from '$lib/components/navigation/mobilenavigation.svelte';

	let { children, data } = $props();

	const history = new SearchRecordStorage(data.network);
	const settings = new SettingsState();
	const wharf = new WharfState(settings);
	const initialMarketValue = new MarketState(data.network, settings);
	const initialNetworkValue = new NetworkValueState({
		network: data.network,
		market: initialMarketValue,
		settings: settings
	});

	let market = $state(initialMarketValue);
	let networkValue = $state(initialNetworkValue);

	let account: AccountState | undefined = $state();
	let accountValue: AccountValueState | undefined = $state();

	setContext<UnicoveContext>('state', {
		get account() {
			return account;
		},
		get history() {
			return history;
		},
		get network() {
			return data.network;
		},
		get settings() {
			return settings;
		},
		get wharf() {
			return wharf;
		}
	});
	setContext<MarketContext>('market', {
		get account() {
			return accountValue;
		},
		get market() {
			return market;
		},
		get network() {
			return networkValue;
		}
	});

	export function setAccount(name: NameType, fetchOverride?: typeof fetch): AccountState {
		account = new AccountState(data.network, name, fetchOverride);
		account.refresh();
		if (!data.network.chain.id.equals(account.network.chain.id)) {
			market = new MarketState(data.network, settings);
			market.refresh();
			networkValue = new NetworkValueState({
				network: data.network,
				market,
				settings: settings
			});
		}
		accountValue = new AccountValueState({
			account,
			network: data.network,
			market,
			settings: settings
		});
		return account;
	}

	$effect(() => {
		const { session } = wharf;
		untrack(() => {
			if (session) {
				setAccount(session.actor);
			} else {
				account = undefined;
				accountValue = undefined;
			}
		});
	});

	$effect(() => {
		const currency = settings.data.displayCurrency;
		untrack(() => {
			console.log('refreshing currency');
			market.refresh();
		});
	});

	async function setupWharf() {
		if (!wharf.sessionKit) {
			wharf.init(data.network);
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
	const ACCOUNT_UPDATE_INTERVAL = Number(env.PUBLIC_ACCOUNT_UPDATE_INTERVAL) || 5_000;
	const NETWORK_UPDATE_INTERVAL = Number(env.PUBLIC_NETWORK_UPDATE_INTERVAL) || 5_000;
	const MARKET_UPDATE_INTERVAL = Number(env.PUBLIC_MARKET_UPDATE_INTERVAL) || 60_000;

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

		// Update the market state on a set interval
		const marketInterval = setInterval(() => {
			market.refresh();
		}, MARKET_UPDATE_INTERVAL);

		// Show the banner if localStorage has no flag set
		showBanner = !localStorage.getItem('hide-v1-banner');

		// Load markets immediately
		market.refresh();

		return () => {
			clearInterval(accountInterval);
			clearInterval(networkInterval);
			clearInterval(marketInterval);
		};
	});

	function hideBanner() {
		// update the store to immediately hide the banner
		showBanner = false;
		// set the flag to prevent banner showing on next load
		localStorage.setItem('hide-v1-banner', 'true');
	}

	const seo_config = $derived<SeoConfig>(
		extend({}, data.baseMetaTags, page.data?.pageMetaTags) as SeoConfig
	);
</script>

<Head {seo_config} />

<!-- Preload current chain logo -->
<svelte:head>
	{#if chainLogos.get(String(data.network.chain.id)) !== undefined}
		{@const chainLogo = String(chainLogos.get(String(data.network.chain.id)))}
		<link rel="preload" href={chainLogo} as="image" type="image/png" />
	{/if}
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
	md:grid-rows-[min-content_auto_minmax(0,1fr)]
	md:gap-x-4
	"
>
	<aside
		class="relative col-start-1 col-end-3 row-span-full row-start-1 hidden h-full grid-rows-subgrid md:grid"
	>
		<nav class="sticky top-4 row-span-2 grid max-h-svh grid-rows-subgrid content-start">
			<a href="/{data.network}" class="grid h-12 items-center" aria-label="home">
				<Unicovelogo small class="items-start" />
			</a>
			<SideMenuContent network={data.network} />
		</nav>
	</aside>

	<header class="col-span-full row-start-1 flex h-12 items-center justify-between">
		<MobileNavigation network={data.network} />

		<div
			class="flex items-center justify-end gap-4 sm:col-start-4 md:col-span-full md:col-start-9 md:flex-1 md:gap-4"
		>
			<Search class="max-w-56 flex-1" />

			<AccountSwitcher network={data.network} class="" />
		</div>
	</header>

	<main
		class="col-span-full col-start-1 row-span-full row-start-2 grid grid-cols-subgrid content-start gap-x-4 *:col-span-full md:col-start-3 md:col-end-13 md:px-0 lg:col-end-12"
	>
		{@render children()}
	</main>
</div>
