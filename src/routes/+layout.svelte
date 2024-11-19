<script lang="ts">
	import '../app.css';
	import 'inter-ui/inter-latin.css';
	import '@fontsource/jetbrains-mono/600.css'; // Semibold
	import extend from 'just-extend';
	import { setContext, untrack } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { PlausibleAnalytics } from '@accuser/svelte-plausible-analytics';
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';

	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import Toaster from '$lib/components/toast/toaster.svelte';
	import { AccountState } from '$lib/state/client/account.svelte';
	import { getNetwork, getNetworkFromParams, NetworkState } from '$lib/state/network.svelte';
	import type { NameType } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { WharfState } from '$lib/state/client/wharf.svelte';

	let { children, data } = $props();

	let account: AccountState | undefined = $state();
	let network: NetworkState | undefined = $state();
	const wharf = new WharfState();

	setContext<UnicoveContext>('state', {
		get account() {
			return account;
		},
		get network() {
			return network;
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
		network = state;
		account = new AccountState(network, name, fetchOverride);
		account.refresh();
		return account;
	}

	$effect(() => {
		if (data.network) {
			network = getNetworkFromParams(data.network);
		}
	});

	$effect(() => {
		const { session } = wharf;
		untrack(() => {
			if (session) {
				setAccount(getNetwork(session.chain), session.actor);
			} else {
				account = undefined;
				network = undefined;
			}
		});
	});

	const seo_config = $derived<SeoConfig>(
		extend({}, data.baseMetaTags, $page.data?.pageMetaTags) as SeoConfig
	);
</script>

<svelte:head>
	{#if !PUBLIC_ENVIRONMENT || PUBLIC_ENVIRONMENT !== 'production'}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<Head {seo_config} />

<Toaster />

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>

<PlausibleAnalytics apiHost="https://stats.greymass.com" domain="unicove.com" />
