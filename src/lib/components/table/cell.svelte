<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {
		children: Snippet;
	}
	let { class: className = '', children, ...props }: Props = $props();
</script>

<td class="cell py-3 pl-2 pr-2 first:pl-0 last:pr-0 {className}" {...props}>
	{@render children()}
</td>
