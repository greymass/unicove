<!-- The Box is used to group content with a predefined padding
	this is the basis of the Card component -->

<script lang="ts">
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children: Snippet;
	}

	const { class: className = '', ...props }: Props = $props();
</script>

<div class={cn('box p-4', className)} {...props}>
	{@render props.children()}
</div>
