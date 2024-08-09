<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');
</script>

{#if context.account}
	<h1>RAM: {context.account.name}</h1>
	<pre>{JSON.stringify(context.account.sources, null, 2)}</pre>
{/if}
