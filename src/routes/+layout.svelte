<script lang="ts">
	import '../app.css';
	import '$lib/utils/dayjs'; // setup dayjs
	import { PlausibleAnalytics } from '@accuser/svelte-plausible-analytics';
	import { PUBLIC_ENVIRONMENT, PUBLIC_ANALYTICS_DOMAIN } from '$env/static/public';

	import Toaster from '$lib/components/toast/toaster.svelte';

	let { children } = $props();
</script>

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
