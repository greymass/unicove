<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages';

	export let data: PageData;
</script>

<div class="p-2">
	<h2 class="h2 text-2xl">{m.common_traces()} ({data.transaction.traces.length})</h2>
	<p>{m.common_traces_description()}</p>
</div>

{#each data.transaction.traces as trace}
	<Code collapsible json={trace} />
{/each}
