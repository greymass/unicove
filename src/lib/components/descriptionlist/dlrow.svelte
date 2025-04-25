<script lang="ts">
	import type { Snippet } from 'svelte';
	import DT from './dt.svelte';
	import DD from './dd.svelte';

	interface Props {
		title: string;
		description?: string;
		children?: Snippet;
	}

	let { title = '', description, children }: Props = $props();
</script>

<div
	class="border-outline-variant flex flex-wrap items-center justify-between gap-x-4 border-b py-3 last:border-none @xs:flex-nowrap"
>
	<DT>{title}</DT>
	<div
		class="grow bg-red-500 before:content-['ERROR_Missing_DD_element_'] has-[dd]:bg-transparent has-[dd]:before:hidden"
	>
		{#if description}
			<DD>{description}</DD>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
