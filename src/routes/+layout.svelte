<script lang="ts">
	import '../app.css';
	import 'inter-ui/inter-latin.css';
	import extend from 'just-extend';
	import { onMount, setContext, untrack } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';

	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import Navigation from '$lib/components/navigation/mobilenavigation.svelte';
	import Toaster from '$lib/components/toast/toaster.svelte';
	import { AccountState } from '$lib/state/client/account.svelte';
	import { getNetwork, NetworkState } from '$lib/state/network.svelte';
	import type { NameType } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { WharfState } from '$lib/state/client/wharf.svelte';
	import Sidemenu from '$lib/components/navigation/sidemenu.svelte';
	import AccountSwitcher from '$lib/components/select/account.svelte';

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

	const seo_config: SeoConfig = $derived<SeoConfig>(
		extend({}, data.baseMetaTags, $page.data.pageMetaTags)
	);

	onMount(() => {
		wharf.init();
		wharf.restore();
	});
</script>

<Head {seo_config} />

<Toaster />

<ParaglideJS {i18n}>
	<div
		class="relative grid h-full grid-cols-1 grid-rows-[minmax(0,1fr)_auto] md:grid-cols-[auto_minmax(0,1fr)]"
	>
		<AccountSwitcher />
		<aside class="relative hidden md:block">
			<Sidemenu {network} />
		</aside>
		<main class="px-4 py-4">
			{@render children()}
		</main>
		<aside class="relative md:hidden">
			<Navigation {network} />
		</aside>
	</div>
</ParaglideJS>
