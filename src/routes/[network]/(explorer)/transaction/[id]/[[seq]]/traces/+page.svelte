<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="p-2">
	<h2 class="h2 text-2xl">Traces ({data.transaction.traces.length})</h2>
	<p>The individual transaction traces from the transaction.</p>
</div>

{#each data.transaction.traces as trace}
	<Code collapsible json={trace} />
{/each}
