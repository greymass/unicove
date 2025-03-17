<script lang="ts">
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}
	let props: Props = $props();
</script>

<div class={cn('col-span-full space-y-6 overflow-x-hidden @3xl:col-span-2', props.class)}>
	{@render props.children()}
</div>
