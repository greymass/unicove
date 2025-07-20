<script lang="ts">
	import '../app.css';
	import '$lib/utils/dayjs'; // setup dayjs
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { PlausibleAnalytics } from '@accuser/svelte-plausible-analytics';
	import { PUBLIC_ENVIRONMENT, PUBLIC_ANALYTICS_DOMAIN } from '$env/static/public';

	import { i18n } from '$lib/i18n';
	import Toaster from '$lib/components/toast/toaster.svelte';

	let { children } = $props();
</script>

<svelte:head>
	{#if PUBLIC_ENVIRONMENT !== 'production'}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<Toaster />

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>

{#if PUBLIC_ENVIRONMENT === 'production'}
	<PlausibleAnalytics apiHost="https://stats.greymass.com" domain={PUBLIC_ANALYTICS_DOMAIN} />
{/if}
