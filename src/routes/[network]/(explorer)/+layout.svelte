<script lang="ts">
	import { page } from '$app/stores';
	import { Stack } from '$lib/components/layout';
	import Pageheader from '$lib/components/pageheader.svelte';

	const { children, data } = $props();
</script>

<Stack tag="article" class="gap-6 @container">
	<Pageheader
		network={data.network}
		title={$page.data.title}
		subtitle={$page.data.subtitle}
		backPath={$page.data.backPath}
		contract={$page.data.account.contract}
	/>

	{@render children()}
</Stack>
