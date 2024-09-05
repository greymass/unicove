<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableSectionElement> {
		children: Snippet;
	}
	let { children, ...props }: Props = $props();
</script>

<tbody class="table-body" {...props}>
	{@render children()}
</tbody>
