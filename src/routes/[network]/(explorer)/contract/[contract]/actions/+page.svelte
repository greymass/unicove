<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

Actions

<ul>
	{#each data.abi.actions as action}
		<li>
			<a href="/{data.network}/contract/{data.contract}/actions/{action.name}">
				{action.name}
			</a>
		</li>
	{/each}
</ul>
