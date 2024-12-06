<script lang="ts">
	import type { Snippet } from 'svelte';
	import Dlrow from './dlrow.svelte';

	type DescriptionItem = {
		title: string;
		description: string;
	};

	interface Props {
		items?: DescriptionItem[];
		children?: Snippet;
	}

	let props: Props = $props();
</script>

<dl class="@container">
	{#if props.items}
		{#each props.items as { title, description }}
			<Dlrow {title} {description} />
		{/each}
	{:else if props.children}
		{@render props.children()}
	{/if}
</dl>
