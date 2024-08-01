<script lang="ts">
	import '../app.css';
	import 'inter-ui/inter-latin.css';
	import extend from 'just-extend';
	import { onMount } from 'svelte';
	import { Head, type SeoConfig } from 'svead';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';

	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n';
	import Navigation from '$lib/components/navigation/appnavigation.svelte';
	import Toaster from '$lib/components/toast/toaster.svelte';

	let { children, data } = $props();

	const { wharf } = data;

	const seo_config: SeoConfig = $derived<SeoConfig>(
		extend({}, data.baseMetaTags, $page.data.pageMetaTags)
	);

	// Number of ms between network updates
	const NETWORK_UPDATE_INTERVAL = 30_000;

	onMount(() => {
		// Initialize Wharf and restore session state
		wharf.init();
		wharf.restore();

		// Update the network state on a set interval
		const networkInterval = setInterval(() => {
			wharf.network.refresh();
		}, NETWORK_UPDATE_INTERVAL);

		return () => {
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
