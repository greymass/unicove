<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { getWharf } from '$lib/wharf/service.svelte';

	const wharf = getWharf();

	export let data: PageData;
</script>

{#if wharf.session}
	<h1>Transfer: {wharf.session.actor}</h1>
{/if}

{#if wharf.account}
	<pre>{JSON.stringify(wharf.account.data, null, 2)}</pre>
{/if}
