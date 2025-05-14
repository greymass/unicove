<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}
	const props: Props = $props();
</script>

<div
	class={cn(
		'bg-surface-container-highest text-on-surface-variant w-fit max-w-fit content-center rounded-md px-2 py-1 text-center text-xs leading-none font-semibold',
		props.class
	)}
>
	{@render props.children()}
</div>
