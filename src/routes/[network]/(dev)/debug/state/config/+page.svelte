<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import { Stack } from '$lib/components/layout';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';

	const context = getContext<UnicoveContext>('state');
</script>

<Stack>
	<h2 class="h2">Chain Configuration State (Client)</h2>
	<p>The chain configuration as it exists in the client.</p>
	{#if PUBLIC_ENVIRONMENT !== 'production'}
		<p>
			<Button href={`/${context.network}/api/config`}>Open SSR chain configuration</Button>
		</p>
	{/if}
	<Code>
		{JSON.stringify(context.network.config, null, 2)}
	</Code>
</Stack>
