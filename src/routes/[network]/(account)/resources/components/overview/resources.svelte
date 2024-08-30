<script lang="ts">
	import CircleProgress from '$lib/components/circleprogress.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		title: string;
		size: string;
		used: string;
		percentage: number;
	}

	const { children, title, size, used, percentage }: Props = $props();
</script>

<div class="flex items-center justify-between rounded-2xl bg-[#202429] p-6">
	<div class="flex shrink-0 items-center justify-center gap-4">
		<CircleProgress {percentage}>
			<div>{title}</div>
		</CircleProgress>
		<div class="space-y-3">
			<h2>{title}</h2>
			<h3>{size}</h3>
			<p>{used}</p>
		</div>
	</div>
	{#if children}
		<div>{@render children()}</div>
	{/if}
</div>
