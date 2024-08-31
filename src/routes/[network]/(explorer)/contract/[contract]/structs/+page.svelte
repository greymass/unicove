<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

<ul>
	{#each data.abi.structs as struct}
		<li>
			<a href="/{data.network}/contract/{data.contract}/structs/{struct.name}">
				{struct.name}
			</a>
		</li>
	{/each}
</ul>
