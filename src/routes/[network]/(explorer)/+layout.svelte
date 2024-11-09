<script lang="ts">
	import Pageheader from '$lib/components/pageheader.svelte';
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout';

	const { children, data } = $props();
</script>

<Stack tag="article" class="gap-6">
	<Pageheader
		network={data.network}
		title={$page.data.title}
		subtitle={$page.data.subtitle}
		backPath={$page.data.backPath}
	/>

	{@render children()}
</Stack>
