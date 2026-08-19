<script lang="ts">
	interface Props {
		approved: number;
		requested: number;
		satisfied?: number | null;
		threshold?: number | null;
		possible?: number | null;
	}

	const {
		approved,
		requested,
		satisfied = null,
		threshold = null,
		possible = null
	}: Props = $props();

	const known = $derived(
		satisfied !== null && threshold !== null && possible !== null && possible > 0
	);
	const fill = $derived.by(() => {
		if (known) return Math.min(100, Math.round((satisfied! / possible!) * 100));
		return requested ? Math.round((approved / requested) * 100) : 0;
	});
	const marker = $derived(known ? Math.min(100, (threshold! / possible!) * 100) : null);
</script>

<div>
	{#if known}
		<span class="text-headline-sm">{satisfied}</span>
		<span class="text-muted text-sm">approved · {threshold} of {possible} needed</span>
	{:else}
		<span class="text-headline-sm">{approved}</span>
		<span class="text-muted text-sm">of {requested} requested approvals</span>
	{/if}
	<div
		class="bg-surface-container-highest relative mt-2 h-2 overflow-hidden rounded-full"
		role="progressbar"
		aria-valuemin={0}
		aria-valuemax={known ? threshold : requested}
		aria-valuenow={known ? satisfied : approved}
	>
		<div class="bg-primary h-full" style="width: {fill}%"></div>
		{#if marker !== null && marker < 100}
			<span class="bg-outline absolute inset-y-0 w-0.5" style="left: {marker}%"></span>
		{/if}
	</div>
</div>
