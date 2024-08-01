<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	import { getWharf } from '$lib/wharf/service.svelte';

	const wharf = getWharf();
</script>

{#if wharf.account}
	<Code>{JSON.stringify(wharf.account.data, null, 2)}</Code>
{/if}
