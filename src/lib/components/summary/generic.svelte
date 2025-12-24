<script lang="ts">
	import GenericSummary from './generic.svelte';

	interface Props {
		data: Record<string, unknown>;
	}

	let { data }: Props = $props();
</script>

<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
	{#each Object.entries(data) as [key, value]}
		<div class="text-on-surface-variant font-medium">{key}:</div>
		<div class="font-mono break-all">
			{#if typeof value === 'object' && value !== null}
				<GenericSummary data={value as Record<string, unknown>} />
			{:else}
				{String(value)}
			{/if}
		</div>
	{/each}
</div>
