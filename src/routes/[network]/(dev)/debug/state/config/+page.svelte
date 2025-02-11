<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { Stack } from '$lib/components/layout';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');
</script>

<Stack>
	<h2 class="h2">Chain Configuration State (Client)</h2>
	<p>The chain configuration as it exists in the client.</p>
	<p>
		<a href={`/${context.network}/api/config`}> Open SSR chain configuration </a>
	</p>
	<Code>
		{JSON.stringify(context.network.config, null, 2)}
	</Code>
</Stack>
