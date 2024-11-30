<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
	}
	let { title, children }: Props = $props();
</script>

<div
	class="flex flex-wrap items-center justify-between gap-x-4 border-b border-mineShaft-900 py-3 last:border-none @xs:flex-nowrap"
>
	<dt class="caption self-start text-nowrap">{title}</dt>
	<dd class="grow text-balance break-all text-right tabular-nums">{@render children()}</dd>
</div>
