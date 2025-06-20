<script lang="ts">
	import '../app.css';
	import '@fontsource/jetbrains-mono/600.css'; // Semibold
	import '$lib/utils/dayjs'; // setup dayjs
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { PlausibleAnalytics } from '@accuser/svelte-plausible-analytics';
	import { PUBLIC_ENVIRONMENT, PUBLIC_ANALYTICS_DOMAIN } from '$env/static/public';

	import { i18n } from '$lib/i18n';
	import Toaster from '$lib/components/toast/toaster.svelte';

	let { children } = $props();
	import Button from '$lib/components/button/button.svelte';

	async function runBlockingWorker(duration = 3000) {
		const WorkerModule = await import('$lib/workers/blocking?worker');
		const worker = new WorkerModule.default();

		worker.onmessage = (e) => {
			console.log(`[Worker] ${e.data.status}`, e.data);
		};

		worker.postMessage({ ms: duration });

		return worker;
	}

	function simulateBlockingTask(ms: number) {
		const end = Date.now() + ms;
		while (Date.now() < end) {
			// Busy loop — blocks the thread
			Math.sqrt(Math.random() * 1e6); // Just some CPU work
		}
	}
</script>

<svelte:head>
	{#if PUBLIC_ENVIRONMENT !== 'production'}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<Toaster />

<div class="grid w-full grid-cols-2 gap-x-2">
	<p class="col-span-full my-2">
		Click a button to run a blocking process then navigate around the site.
	</p>
	<Button onclick={() => simulateBlockingTask(5000)}>Block Main Thread</Button>
	<Button onclick={() => runBlockingWorker(5000)}>Block in Worker</Button>
</div>

<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>

{#if PUBLIC_ENVIRONMENT === 'production'}
	<PlausibleAnalytics apiHost="https://stats.greymass.com" domain={PUBLIC_ANALYTICS_DOMAIN} />
{/if}
