<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import type { Snippet } from 'svelte';
	interface Props {
		children: Snippet;
		isCurrentUser?: boolean;
	}
	let props: Props = $props();
</script>

<Stack class="gap-2 @container">
	<h5 class="h5">Breakdown</h5>
	{#if props.isCurrentUser}
		<div class="grid grid-cols-3 gap-0">
			{@render props.children()}
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-0">
			{@render props.children()}
		</div>
	{/if}
</Stack>
