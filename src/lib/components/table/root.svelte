<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableElement> {
		children: Snippet;
		fixed?: boolean;
	}

	let { children, fixed = false, ...props }: Props = $props();
</script>

<table
	class="table w-full overflow-x-auto"
	class:table-fixed={fixed}
	class:table-auto={!fixed}
	{...props}
>
	{@render children()}
</table>
