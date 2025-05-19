<script lang="ts">
	import '../app.css';
	import '@fontsource/jetbrains-mono/600.css'; // Semibold
	import '$lib/utils/dayjs'; // setup dayjs
	import { page } from '$app/state';
	import { PlausibleAnalytics } from '@accuser/svelte-plausible-analytics';
	import { PUBLIC_ENVIRONMENT, PUBLIC_ANALYTICS_DOMAIN } from '$env/static/public';
	import { locales, localizeHref } from '$lib/paraglide/runtime';

	import Toaster from '$lib/components/toast/toaster.svelte';

	let { children } = $props();
</script>

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>

<svelte:head>
	{#if PUBLIC_ENVIRONMENT !== 'production'}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<Toaster />

{@render children()}

{#if PUBLIC_ENVIRONMENT === 'production'}
	<PlausibleAnalytics apiHost="https://stats.greymass.com" domain={PUBLIC_ANALYTICS_DOMAIN} />
{/if}
