<script lang="ts">
	import type { Snippet } from 'svelte';
	import Dlrow from './dlrow.svelte';
	import { cn } from '$lib/utils/style';

	type DescriptionItem = {
		title: string;
		description: string;
	};

	interface Props {
		items?: DescriptionItem[];
		children?: Snippet;
		class?: string;
	}

	let props: Props = $props();
</script>

<dl class={cn('@container', props.class)}>
	{#if props.items}
		{#each props.items as { title, description }}
			<Dlrow {title} {description} />
		{/each}
	{:else if props.children}
		{@render props.children()}
	{/if}
</dl>
