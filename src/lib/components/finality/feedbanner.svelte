<script lang="ts">
	import type { FinalityConnection } from '$lib/state/finality/connection';
	import type { FinalityState } from '$lib/state/finality/state';
	import { formatClock } from './labels.svelte';

	interface Props {
		connection: FinalityConnection;
		current: FinalityState;
		now: number;
	}

	const { connection, current, now }: Props = $props();

	const QUIET_MS = 3_000;
	const CATCHING_HOLD_MS = 4_000;

	let catchingUntil = $state(0);

	$effect(() => {
		if (current.feed?.state === 'catching_up') catchingUntil = Date.now() + CATCHING_HOLD_MS;
	});

	const newest = $derived(current.blocks[current.blocks.length - 1]);
	const lastTime = $derived(current.feed?.last_block_time ?? newest?.timestamp ?? null);
	const lastNum = $derived(current.feed?.last_block ?? newest?.block_num ?? null);
	const age = $derived(lastTime === null ? null : Math.max(0, Math.round((now - lastTime) / 1000)));
	const stale = $derived(lastTime === null || now - lastTime > QUIET_MS);

	const kind = $derived.by(() => {
		if (!current.ready) return 'connecting';
		if (connection === 'reconnecting') return stale ? 'reconnecting' : null;
		if (current.feed?.state === 'paused') return 'paused';
		if (current.feed?.state === 'catching_up' || now < catchingUntil) return 'catching_up';
		return null;
	});
</script>

{#if kind}
	<div
		role="status"
		class="bg-surface-container text-on-surface-variant rounded-lg px-3 py-2 text-sm"
		class:shadow-[inset_3px_0_0_var(--color-warning)]={kind === 'paused' || kind === 'reconnecting'}
		class:shadow-[inset_3px_0_0_var(--color-primary)]={kind === 'catching_up'}
	>
		{#if kind === 'connecting'}
			Connecting to the finality feed.
		{:else if kind === 'reconnecting'}
			{#if lastNum !== null && lastTime !== null}
				Reconnecting to the finality feed. Last block #{lastNum} at {formatClock(lastTime)} UTC, {age}
				s ago.
			{:else}
				Reconnecting to the finality feed.
			{/if}
		{:else if kind === 'paused'}
			{#if lastNum !== null && lastTime !== null}
				Feed paused. Last block #{lastNum} at {formatClock(lastTime)} UTC, {age} s ago.
			{:else}
				Feed paused.
			{/if}
		{:else}
			Catching up. Blocks received during the gap carry no timing.
		{/if}
	</div>
{/if}
