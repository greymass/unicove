<script lang="ts">
	import { Code } from 'unicove-components';
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages';

	const { data } = $props<{ data: PageData }>();
</script>

<div class="p-2">
	<h2 class="text-headline text-2xl">{m.common_traces()} ({data.transaction.traces.length})</h2>
	<p>{m.common_traces_description()}</p>
</div>

{#each data.transaction.traces as trace}
	<Code collapsible json={trace} />
{/each}
