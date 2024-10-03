<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import { ActivityAction } from '$lib/types.js';

	const { data } = $props();
</script>

{#each data.activity.actions as row}
	{@const action = ActivityAction.from(row)}
	<div class="my-4 space-y-2">
		<h3 class="h3">
			{action.contract}::{action.action}
		</h3>
		<p>
			Time:
			{action.timestamp}
		</p>
		<p>
			Transaction:
			<a href="/{data.network.shortname}/transaction/{action.id}">
				{String(action.id).substring(0, 7)}
			</a>
		</p>
		<p>
			Action:
			<a href="/{data.network.shortname}/transaction/{action.id}/{action.seq}">
				{String(action.id).substring(0, 7)}/{action.seq}
			</a>
		</p>
		<Code>{JSON.stringify(action.authorizations, null, 2)}</Code>
		<Code>{JSON.stringify(action.data, null, 2)}</Code>
		<Code>{JSON.stringify(action.raw, null, 2)}</Code>
	</div>
{/each}
