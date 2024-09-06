<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		hoverEffect?: boolean;
		children: Snippet;
	}
	let { hoverEffect = true, ...props }: Props = $props();
</script>

<tr
	class="
	table-row
	border-b
	border-neutral-300/10
	bg-gradient-to-r
	from-transparent
	to-transparent
	last:border-none
	odd:via-mineShaft-950
	group-[.table-head]:bg-none
	{hoverEffect ? 'hover:via-skyBlue-500/10' : ''}
	"
	{...props}
>
	{@render props.children()}
</tr>
