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
		'w-fit rounded-md bg-mineShaft-900 px-2 py-1 text-xs font-semibold leading-none text-mineShaft-50',
		props.class
	)}
>
	{@render props.children()}
</div>
