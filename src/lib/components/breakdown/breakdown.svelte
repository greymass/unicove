<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		children: Snippet;
		isCurrentUser?: boolean;
		title?: string;
	}
	let props: Props = $props();
</script>

<Stack class="@container gap-2">
	<h5 class="h5">
		{props.title || m.common_breakdown()}
	</h5>
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
