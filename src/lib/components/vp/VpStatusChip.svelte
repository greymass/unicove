<script lang="ts">
	import { Chip } from '@wharfkit/svelte-components';
	import type { VpStatus } from '$lib/vp/types';

	interface Props {
		status: VpStatus;
	}

	const { status }: Props = $props();
	// Lowercase keys keep wuchale from translating the comparison literals.
	const key = $derived(status.toLowerCase());

	const variants: Record<VpStatus, string> = {
		Draft: 'bg-surface-container-high text-muted',
		Review: 'bg-warning-container text-on-warning-container',
		Proposed: 'bg-primary-container text-on-primary-container',
		Executed: 'bg-success-container text-on-success-container',
		Rejected: 'bg-error-container text-on-error-container',
		Withdrawn: 'bg-surface-container-high text-muted',
		Superseded: 'bg-surface-container-high text-muted'
	};
</script>

<Chip class={variants[status]}>
	{#if key === 'draft'}
		Draft
	{:else if key === 'review'}
		Review
	{:else if key === 'proposed'}
		Proposed
	{:else if key === 'executed'}
		Executed
	{:else if key === 'rejected'}
		Rejected
	{:else if key === 'withdrawn'}
		Withdrawn
	{:else}
		Superseded
	{/if}
</Chip>
