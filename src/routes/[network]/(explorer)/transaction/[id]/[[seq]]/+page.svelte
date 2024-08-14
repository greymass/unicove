<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	export let data: PageData;
</script>

{#if data.seq}
	{@const trace = data.transaction.traces.find(
		(t) => String(t.receipt.global_sequence) === data.seq
	)}
	<Code>{JSON.stringify(trace, null, 2)}</Code>
{:else}
	<Code>{JSON.stringify(data.transaction, null, 2)}</Code>
{/if}
