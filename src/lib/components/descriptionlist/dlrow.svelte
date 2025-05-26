<script lang="ts">
	import type { Snippet } from 'svelte';
	import DT from './dt.svelte';
	import DD from './dd.svelte';

	interface Props {
		title: string | Snippet;
		description?: string;
		children?: Snippet;
	}

	let { title = '', description, children }: Props = $props();
</script>

<div
	class="border-outline flex flex-wrap items-center justify-between gap-x-4 border-b py-3 last:border-none @xs:flex-nowrap"
>
	<DT>
		{#if typeof title === 'string'}
			{title}
		{:else}
			{@render title()}
		{/if}
	</DT>
	<div
		class="bg-error-container grow before:content-['ERROR_Missing_DD_element_'] has-[dd]:bg-transparent has-[dd]:before:hidden"
	>
		{#if description}
			<DD>{description}</DD>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
