<script lang="ts">
	import { Checksum256, type NameType } from '@wharfkit/antelope';
	import { ChainDefinition } from '@wharfkit/common';
	import { onMount, setContext, untrack } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import extend from 'just-extend';

	import {
		PUBLIC_ACCOUNT_UPDATE_INTERVAL,
		PUBLIC_NETWORK_UPDATE_INTERVAL,
		PUBLIC_MARKET_UPDATE_INTERVAL
	} from '$env/static/public';
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
	import type { NetworkState } from '$lib/state/network.svelte.js';

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

	let chain: ChainDefinition | undefined = $state();
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
			setMarket(data.network);
			setMarketNetwork(data.network);
		}
		setMarketAccount(data.network, account);
		return account;
	}

	async function setMarket(network: NetworkState) {
		market = new MarketState(network, settings);
		market.refresh();
	}

	function setMarketNetwork(network: NetworkState) {
		networkValue = new NetworkValueState({
			network,
			market,
			settings
		});
	}

	function setMarketAccount(network: NetworkState, account: AccountState) {
		accountValue = new AccountValueState({
			account,
			network,
			market,
			settings
		});
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
		untrack(() => {
			if (chain && !network.chain.equals(chain)) {
				// Set new chain
				chain = network.chain;

				// Set Wharf for new chain
				setupWharf();

				// Set markets for new chain
				setMarket(data.network);
				setMarketNetwork(data.network);
			}
		});
	});

	// Number of ms between network updates
	const ACCOUNT_UPDATE_INTERVAL = Number(PUBLIC_ACCOUNT_UPDATE_INTERVAL);
	const NETWORK_UPDATE_INTERVAL = Number(PUBLIC_NETWORK_UPDATE_INTERVAL);
	const MARKET_UPDATE_INTERVAL = Number(PUBLIC_MARKET_UPDATE_INTERVAL);

	onMount(() => {
		// Set the chain to the current network chain
		chain = data.network.chain;

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

		// Enable Wharf
		setupWharf();

		// Load markets based off chain
		setMarket(data.network);
		setMarketNetwork(data.network);

		return () => {
			clearInterval(accountInterval);
			clearInterval(networkInterval);
			clearInterval(marketInterval);
		};
	});

	const seo_config = $derived<SeoConfig>(
		extend({}, data.baseMetaTags, page.data?.pageMetaTags) as SeoConfig
	);
</script>

<Head {seo_config} />

<svelte:head>
	<!-- Preload current chain logo -->
	<link rel="preload" href={String(data.network.config.logo)} as="image" type="image/png" />

	<!-- Init color scheme on page load -->
	<script>
		(function () {
			if (typeof window !== undefined) {
				const storedTheme = localStorage.getItem('color-scheme');
				const theme =
					storedTheme ||
					(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
				document.documentElement.setAttribute('data-scheme', theme);
				if (!storedTheme) localStorage.setItem('color-scheme', theme);
			}
		})();
	</script>
</svelte:head>

<div
	data-theme={data.network}
	class="mx-auto grid h-full min-h-svh w-[calc(100%-2rem)] max-w-(--breakpoint-2xl) grid-cols-2 grid-rows-[min-content_minmax(0,1fr)] gap-y-6 pt-4 pb-12 sm:grid-cols-4 md:h-auto md:min-h-svh md:grid-cols-12 md:grid-rows-[min-content_auto_minmax(0,1fr)] md:gap-x-4 xl:w-[calc(100%-6rem)]"
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

			<AccountSwitcher network={data.network} />
		</div>
	</header>

	<main
		class="col-span-full col-start-1 row-span-full row-start-2 grid grid-cols-subgrid content-start gap-x-4 *:col-span-full md:col-start-3 md:col-end-13 md:px-0 xl:col-end-13"
	>
		{@render children()}
	</main>
</div>
