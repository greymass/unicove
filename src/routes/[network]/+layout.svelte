<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Checksum256 } from '@wharfkit/antelope';
	import MobileNavigation from '$lib/components/navigation/mobilenavigation.svelte';
	import SideMenuContent from '$lib/components/navigation/sidemenu.svelte';
	import AccountSwitcher from '$lib/components/accountswitch.svelte';
	import UnicoveLogo from '$lib/assets/unicovelogo.svelte';
	import Search from '$lib/components/input/search.svelte';
	import X from 'lucide-svelte/icons/circle-x';
	// import Footer from '$lib/components/footer.svelte';

	let { children, data } = $props();

	const context = getContext<UnicoveContext>('state');

	async function setupWharf() {
		if (!context.wharf.sessionKit) {
			context.wharf.init();
		}

		const sessions = await context.wharf.sessionKit?.getSessions();
		if (sessions) {
			const lastUsedSession = context.wharf.chainsSession[String(data.network.chain.id)];
			const anyValidSession =
				sessions.length > 0
					? sessions.find((s) => Checksum256.from(s.chain).equals(data.network.chain.id))
					: undefined;
			if (lastUsedSession) {
				context.wharf.restore(lastUsedSession);
			} else if (anyValidSession) {
				context.wharf.restore(anyValidSession);
			} else {
				context.wharf.reset();
			}
		}
	}

	$effect(() => {
		const { network } = data; // Destructure to force reactivity
		if (!context.account) {
			// no account loaded
			setupWharf();
		} else if (context.account && !context.account.network.chain.equals(network.chain)) {
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
			if (context.account) {
				context.account.refresh();
			}
		}, ACCOUNT_UPDATE_INTERVAL);

		// Update the network state on a set interval
		const networkInterval = setInterval(() => {
			if (context.network) {
				context.network.refresh();
			}
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
</script>

{#if showBanner}
	<aside class="flex items-center justify-between gap-4 bg-mineShaft-950 pl-4 shadow">
		<p class="py-4 text-white">
			Looking for the old version of Unicove? Go to
			<a class="underline" href="https://v1.unicove.com">v1.unicove.com</a>
		</p>
		<button class="grid size-12 place-items-center" onclick={hideBanner}>
			<X class="size-4" />
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
	pt-4
	sm:grid-cols-4
	md:h-auto
	md:min-h-svh
	md:grid-cols-12
	md:grid-rows-[min-content_minmax(0,1fr)]
	md:gap-x-4
	"
>
	<header class="col-span-full flex items-center justify-between">
		<!-- Larger breakpoints only	 -->
		<a href="/{data.network}" class="hidden w-min place-self-center md:block">
			<UnicoveLogo small />
		</a>

		<MobileNavigation network={data.network} />

		<div
			class="flex items-center justify-end gap-4 sm:col-start-4 md:col-span-full md:col-start-9 md:flex-1 md:gap-4"
		>
			<Search network={data.network} class="max-w-48 flex-1" />

			<AccountSwitcher network={data.network} class="" />
		</div>
	</header>

	<aside class="relative row-start-2 hidden h-full md:block">
		<SideMenuContent class="" network={data.network} />
	</aside>

	<main
		class="col-span-full col-start-1 row-start-2 grid grid-cols-subgrid content-start gap-x-4 *:col-span-full md:col-start-3 md:col-end-12 md:px-0"
	>
		{@render children()}
	</main>

	<!-- <Footer /> -->
</div>

<!-- This wrapper sets up the bottom menu on mobile, becomes hidden on desktop -->
<!-- <aside -->
<!-- 	class="px-page fixed bottom-0 z-50 flex h-14 w-full justify-between bg-shark-950 py-2 md:hidden" -->
<!-- > -->
<!-- 	<MobileNavigation network={data.network} /> -->
<!---->
<!-- 	<Search network={data.network} /> -->
<!-- </aside> -->
