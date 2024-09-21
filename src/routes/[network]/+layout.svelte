<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Checksum256 } from '@wharfkit/antelope';
	import MobileNavigation from '$lib/components/navigation/mobilenavigation.svelte';
	import AccountSwitcher from '$lib/components/select/account.svelte';
	import UnicoveLogo from '$lib/assets/unicovelogo.svelte';
	import Search from '$lib/components/input/search.svelte';

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

		return () => {
			clearInterval(accountInterval);
			clearInterval(networkInterval);
		};
	});
</script>

<!-- This is the main layout using grid columns and rows to align elements that appear at specific breakpoints -->
<div
	class="
	relative
	grid
	h-full
	min-h-svh
	w-svw
	max-w-screen-xl
	grid-cols-[16px_auto_auto_16px]
	grid-rows-[0_min-content_auto_56px]
	gap-y-4
	bg-shark-950
	md:h-auto
	md:min-h-svh
	md:grid-cols-[auto_minmax(0,1fr)_auto_auto_32px]
	md:grid-rows-[16px_minmax(0,1fr)_16px]
	md:gap-x-4
	md:gap-y-0
	"
>
	<!-- This is the small unicove logo that appears on mobile only -->
	<UnicoveLogo small network={data.network} class="col-start-2 row-start-2 w-min md:hidden" />

	<!-- The account switcher remains in the top right on mobile and desktop -->
	<div
		class="col-start-3 row-start-2 flex justify-end md:col-start-4 md:col-end-5 md:row-start-2 md:row-end-3 md:px-4"
	>
		<AccountSwitcher network={data.network} />
	</div>

	<main
		class="col-span-2 col-start-2 row-start-3 md:col-span-3 md:col-start-2 md:row-start-2 md:row-end-4 md:pt-16"
	>
		{@render children()}
	</main>

	<!-- This wrapper sets up the bottom menu on mobile, becomes a pass-thru component on desktop -->
	<aside
		class="fixed bottom-0 z-50 col-span-4 grid h-14 w-full grid-cols-subgrid bg-shark-950 px-4 py-2 md:contents"
	>
		<!-- This element is the sidebar on desktop, collapsible menu on mobile -->
		<MobileNavigation
			network={data.network}
			class="col-start-1 col-end-2 md:row-start-1 md:row-end-4"
		/>

		<!-- This search box is in the bottom menu on mobile, top header on desktop -->
		<Search
			network={data.network}
			class="col-start-2 col-end-3  md:col-start-3 md:col-end-4 md:row-start-2 md:row-end-3"
		/>
	</aside>
</div>
