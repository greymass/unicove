<script lang="ts">
	import CircleProgress from '$lib/components/circleprogress.svelte';
	import type { Snippet } from 'svelte';
	import { ResourceState } from '../../state.svelte';

	interface Props {
		children?: Snippet;
		resourceState: ResourceState;
	}

	const { children, resourceState }: Props = $props();
</script>

<div class="flex items-center justify-between rounded-2xl bg-[#202429] p-6">
	<div class="flex shrink-0 items-center justify-center gap-4">
		<CircleProgress percentage={resourceState.usagePerc}>
			<div>{resourceState.name}</div>
		</CircleProgress>
		<div class="space-y-3">
			<h2>{resourceState.name}</h2>
			<h3>{resourceState.usedSize} {resourceState.unit}</h3>
			<p>{resourceState.usagePerc}% Quota used</p>
		</div>
	</div>
	{#if children}
		<div>{@render children()}</div>
	{/if}
</div>
