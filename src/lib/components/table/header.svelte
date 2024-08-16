<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLThAttributes } from 'svelte/elements';

	interface Props extends HTMLThAttributes {
		children: Snippet;
	}
	let { class: className = '', children, ...props }: Props = $props();
</script>

<th
	class="table-header py-1.5 pl-2 pr-2 text-left font-medium text-mineShaft-200/60 first:pl-0 last:pr-0 {className}"
	{...props}
>
	{@render children()}
</th>
