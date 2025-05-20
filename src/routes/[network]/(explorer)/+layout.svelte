<script lang="ts">
	import { page } from '$app/state';
	import { Stack } from '$lib/components/layout';
	import Pageheader from '$lib/components/pageheader.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');
	const { children, data } = $props();

	const tags = $derived(
		page.data.account ? context.meta.getAccountTags(page.data.account.name) : []
	);
</script>

<Stack tag="article" class="@container gap-6">
	<Pageheader
		network={data.network}
		title={page.data.title}
		subtitle={page.data.subtitle}
		backPath={page.data.backPath}
		actions={page.data?.header?.actions}
		copyData={page.data?.header?.copyData}
		{tags}
	/>

	{@render children()}
</Stack>
