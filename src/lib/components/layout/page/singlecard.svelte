<script lang="ts">
	import { Card } from '$lib/components/layout';
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		class?: string;
	}

	let props: Props = $props();
</script>

<Card class={cn('flex justify-center py-6 *:max-w-md *:grow', props.class)}>
	{@render props.children()}
</Card>
