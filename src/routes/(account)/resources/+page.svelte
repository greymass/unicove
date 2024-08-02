<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	const { data } = $props();
	const { wharf } = $derived(data);
</script>

{#if wharf.session}
	<h1>Resources: {wharf.session.actor}</h1>
{/if}

{#if wharf.account}
	<pre>{JSON.stringify(wharf.account.data, null, 2)}</pre>
{/if}
