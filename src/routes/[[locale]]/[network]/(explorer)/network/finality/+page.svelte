<script lang="ts">
	import { onMount } from 'svelte';
	import { Stack } from '@wharfkit/svelte-components';

	import { FinalityFeed } from '$lib/state/finality/feed.svelte';

	const { data } = $props();

	let feed: FinalityFeed | undefined = $state();

	onMount(() => {
		const { endpoints, short } = data.network.config;
		if (!endpoints.finality) return;
		const instance = new FinalityFeed(endpoints.finality, short);
		feed = instance;
		instance.start();
		return () => {
			instance.stop();
			feed = undefined;
		};
	});
</script>

<Stack class="gap-8">
	<div data-connection={feed?.connection ?? 'connecting'}></div>
</Stack>
