<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}
	const props: Props = $props();
</script>

<div class={cn('w-fit rounded bg-mineShaft-900 px-2 text-mineShaft-50', props.class)}>
	{@render props.children()}
</div>
