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
		'bg-mine-900 text-mine-50 w-fit rounded-md px-2 py-1 text-xs leading-none font-semibold',
		props.class
	)}
>
	{@render props.children()}
</div>
