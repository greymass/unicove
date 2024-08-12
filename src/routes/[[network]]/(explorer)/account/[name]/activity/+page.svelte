<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

{#each data.activity.actions as action}
	<div class="my-4 space-y-2">
		<h3 class="h3">
			{action.contract}::{action.action}
		</h3>
		<p>
			Time:
			{action.timestamp}
		</p>
		<p>
			ID:
			<a href="/transaction/{action.id}">
				{String(action.id).substring(0, 7)}
			</a>
		</p>
		<Code>{JSON.stringify(action.authorizations, null, 2)}</Code>
		<Code>{JSON.stringify(action.data, null, 2)}</Code>
	</div>
{/each}
