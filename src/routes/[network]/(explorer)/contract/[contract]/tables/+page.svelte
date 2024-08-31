<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

<h2 class="h2">Tables</h2>

<ul>
	{#each data.abi.tables as table}
		<li>
			<a href="/{data.network}/contract/{data.contract}/tables/{table.name}">
				{table.name}
			</a>
		</li>
	{/each}
</ul>
