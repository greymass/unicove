<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		hoverEffect?: boolean;
		children: Snippet;
		active?: boolean;
		onclick?: () => void;
	}

	let { onclick, active, hoverEffect = true, ...props }: Props = $props();
</script>

<tr
	data-clickable={onclick !== undefined}
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
	data-[clickable=true]:cursor-pointer
	{hoverEffect ? 'hover:via-skyBlue-500/10' : ''}
	{active ? '!via-skyBlue-500/10' : ''}
	"
	{onclick}
	{...props}
>
	{@render props.children()}
</tr>
