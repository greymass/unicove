<script lang="ts">
	import { page } from '$app/state';
	import { Stack } from '$lib/components/layout';
	import Pageheader from '$lib/components/pageheader.svelte';

	const { children, data } = $props();
</script>

<Stack tag="article" class="@container gap-6">
	<Pageheader
		network={data.network}
		title={page.data.title}
		subtitle={page.data.subtitle}
		backPath={page.data.backPath}
		contract={page.data.account?.contract}
	/>

	{@render children()}
</Stack>
