<script lang="ts">
	import Pageheader from '$lib/components/pageheader.svelte';
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout/index.js';

	const { children, data } = $props();
</script>

<Stack tag="article" class="gap-6">
	<Pageheader network={data.network} title={$page.data.title} subtitle={$page.data.subtitle} />

	{@render children()}
</Stack>
