<!-- The Stack component inserts vertical margins -->

<script lang="ts">
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		tag?: string;
		class?: string;
	}

	const { class: className = '', tag = 'div', ...props }: Props = $props();
</script>

<svelte:element this={tag} class={cn('layout-stack', className)} {...props}>
	{@render props.children()}
</svelte:element>
