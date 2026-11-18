<script lang="ts">
	import type { StageStatus } from '$lib/state/finality/derive';
	import { statusLabel } from './labels.svelte';

	const { status, label }: { status: StageStatus; label?: string } = $props();

	const mark = $derived(
		status === 'normal'
			? 'bg-success rounded-full'
			: status === 'departure' || status === 'above_baseline'
				? 'bg-warning rotate-45 rounded-[1px]'
				: 'bg-outline rounded-full'
	);
</script>

<span class="inline-flex items-center gap-1.5 text-sm font-medium">
	<i class="inline-block size-2 shrink-0 {mark}" aria-hidden="true"></i>{label ??
		statusLabel(status)}
</span>
