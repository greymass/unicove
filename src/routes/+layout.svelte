<script lang="ts">
	import '../app.css';
	import 'inter-ui/inter-latin.css';
	import extend from 'just-extend';
	import { onMount, setContext, untrack } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';

	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import Navigation from '$lib/components/navigation/appnavigation.svelte';
	import Toaster from '$lib/components/toast/toaster.svelte';
	import { getWharf } from '$lib/state/client/wharf.svelte';
	import { AccountState } from '$lib/state/client/account.svelte';
	import { getNetwork, NetworkState } from '$lib/state/network.svelte';
	import type { NameType } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	let { children, data } = $props();
	const { network } = $derived(data);

	const wharf = getWharf();

	let account: AccountState | undefined = $state();
	setContext<UnicoveContext>('state', {
		get account() {
			return account;
		}
	});

	export function setAccount(
		network: NetworkState,
		name: NameType,
		fetchOverride?: typeof fetch
	): AccountState {
		account = new AccountState(network, name, fetchOverride);
		account.refresh();
		return account;
	}

	$effect(() => {
		// Initialize Wharf and restore session state
		wharf.init();

		if (wharf.chainsSession[String(network.chain.id)]) {
			wharf.restore(wharf.chainsSession[String(network.chain.id)]);
		} else {
			wharf.reset();
		}
	});

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

	const seo_config: SeoConfig = $derived<SeoConfig>(
		extend({}, data.baseMetaTags, $page.data.pageMetaTags)
	);

	// Number of ms between network updates
	const ACCOUNT_UPDATE_INTERVAL = 30_000;
	const NETWORK_UPDATE_INTERVAL = 30_000;

	onMount(() => {
		// Update account state on a set interval
		const accountInterval = setInterval(() => {
			if (account) {
				account.refresh();
			}
		}, ACCOUNT_UPDATE_INTERVAL);

		// Update the network state on a set interval
		const networkInterval = setInterval(() => {
			if (network) {
				network.refresh();
			}
		}, NETWORK_UPDATE_INTERVAL);

		return () => {
			clearInterval(accountInterval);
			clearInterval(networkInterval);
		};
	});
</script>

<Head {seo_config} />

<Toaster />

<ParaglideJS {i18n}>
	<Navigation />
	{@render children()}
</ParaglideJS>
