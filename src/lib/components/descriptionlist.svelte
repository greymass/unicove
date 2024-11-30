<script lang="ts">
	import type { Snippet } from 'svelte';

	type DescriptionItem = {
		key: string;
		value: string | Snippet;
	};

	interface Props {
		items: DescriptionItem[];
	}

	let props: Props = $props();
</script>

<dl class="">
	{#each props.items as item}
		<div
			class="flex flex-wrap items-center justify-between gap-x-4 border-b border-mineShaft-900 py-3 *:grow last:border-none"
		>
			<dt class="caption">{item.key}</dt>
			<dd class="text-balance break-all text-right tabular-nums">{item.value}</dd>
		</div>
	{/each}
</dl>
