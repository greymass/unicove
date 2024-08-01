<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
	const { wharf } = data;
</script>

{#if wharf.account}
	<Code>{JSON.stringify(wharf.account.data, null, 2)}</Code>
{/if}
