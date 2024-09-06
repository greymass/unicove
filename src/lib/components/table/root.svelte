<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableElement> {
		children: Snippet;
	}
	let { children, ...props }: Props = $props();
</script>

<table class="table w-full table-auto" {...props}>
	{@render children()}
</table>
