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

	// Number of ms between network updates
	const ACCOUNT_UPDATE_INTERVAL = 3_000;
	const NETWORK_UPDATE_INTERVAL = 3_000;

	onMount(() => {
		setupWharf();

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

<div
	class="
	relative
	grid
	h-full
	w-svw
	grid-cols-[16px_auto_auto_16px]
	grid-rows-[16px_auto_auto_16px]
	md:h-auto
	md:grid-cols-[auto_minmax(0,1fr)_auto_auto_0]
	md:grid-rows-[16px_minmax(0,1fr)]
	md:gap-x-4
	"
>
	<UnicoveLogo small class="col-start-2 row-start-2 w-min md:hidden" />

	<div
		class="col-start-3 row-start-2 flex justify-end md:col-start-4 md:col-end-5 md:row-start-2 md:row-end-3 md:px-4"
	>
		<AccountSwitcher />
	</div>

	<main
		class="col-span-2 col-start-2 row-start-3 overflow-hidden md:col-span-3 md:col-start-2 md:row-start-2 md:row-end-4"
	>
		{@render children()}
	</main>

	<aside
		class="fixed bottom-0 z-50 col-span-4 grid h-14 w-full grid-cols-subgrid bg-shark-950 px-4 py-2 md:contents"
	>
		<MobileNavigation
			network={data.network}
			class="col-start-1 col-end-2 md:row-start-1 md:row-end-3"
		/>

		<Search
			network={data.network}
			debug
			class="col-start-2 col-end-3  md:col-start-3 md:col-end-4 md:row-start-2 md:row-end-3"
		/>
	</aside>
</div>
