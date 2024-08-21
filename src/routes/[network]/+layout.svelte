<script lang="ts">
	import { getContext, onMount } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Checksum256 } from '@wharfkit/antelope';
	import Navigation from '$lib/components/navigation/mobilenavigation.svelte';
	import Sidemenu from '$lib/components/navigation/sidemenu.svelte';
	import AccountSwitcher from '$lib/components/select/account.svelte';
	import UnicoveLogo from '$lib/assets/unicovelogo.svelte';

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

<div class="relative grid h-full auto-rows-min grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)]">
	<aside class="relative hidden md:block">
		<Sidemenu network={data.network} />
	</aside>
	<main class="grid auto-rows-min grid-cols-1 gap-4 px-4 py-4">
		<header
			class="root-layout-header col-start-1 col-end-2 row-start-1 row-end-2 flex flex-wrap items-center justify-between md:justify-end"
		>
			<UnicoveLogo small class="w-min md:hidden" />
			<AccountSwitcher />
		</header>
		<div class="col-start-1 col-end-2 row-start-2 row-end-3 md:row-start-1 md:row-end-3">
			{@render children()}
		</div>
	</main>
	<aside class="relative md:hidden">
		<Navigation network={data.network} />
	</aside>
</div>
