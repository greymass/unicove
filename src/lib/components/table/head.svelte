<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableSectionElement> {
		children: Snippet;
	}
	let { children, ...props }: Props = $props();
</script>

<thead class="table-head group" {...props}>
	{@render children()}
</thead>
