<script lang="ts">
	import '../app.css';
	import '@fontsource/jetbrains-mono/600.css'; // Semibold
	import '$lib/utils/dayjs'; // setup dayjs
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { PlausibleAnalytics } from '@accuser/svelte-plausible-analytics';
	import * as env from '$env/static/public';

	import { i18n } from '$lib/i18n';
	import Toaster from '$lib/components/toast/toaster.svelte';

	let { children } = $props();
</script>

<svelte:head>
	{#if !env.PUBLIC_ENVIRONMENT || env.PUBLIC_ENVIRONMENT !== 'production'}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<Toaster />

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>

{#if env.PUBLIC_ANALYTICS_DOMAIN}
	<PlausibleAnalytics apiHost="https://stats.greymass.com" domain={env.PUBLIC_ANALYTICS_DOMAIN} />
{/if}
