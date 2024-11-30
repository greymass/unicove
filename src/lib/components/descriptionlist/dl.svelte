<script lang="ts">
	import type { Snippet } from 'svelte';
	import Dlrow from './dlrow.svelte';

	type DescriptionItem = {
		key: string;
		value: string;
	};

	interface Props {
		items?: DescriptionItem[];
		children?: Snippet;
	}

	let props: Props = $props();
</script>

<dl class="@container">
	{#if props.items}
		{#each props.items as item}
			<Dlrow title={item.key}>
				{item.value}
			</Dlrow>
		{/each}
	{:else if props.children}
		{@render props.children()}
	{/if}
</dl>
