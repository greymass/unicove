<script lang="ts">
	import { Chip } from 'unicove-components';
	import type { VpStatus } from '$lib/vp/types';

	interface Props {
		status: VpStatus;
	}

	const { status }: Props = $props();

	const variants: Record<VpStatus, string> = {
		Draft: '',
		Review: 'bg-warning/15 text-warning',
		Proposed: 'bg-primary/15 text-primary',
		Executed: 'bg-success/15 text-success',
		Rejected: 'bg-error/15 text-error',
		Withdrawn: 'opacity-60',
		Superseded: 'opacity-60'
	};
</script>

<Chip class={variants[status]}>
	{#if status === 'Draft'}
		Draft
	{:else if status === 'Review'}
		Review
	{:else if status === 'Proposed'}
		Proposed
	{:else if status === 'Executed'}
		Executed
	{:else if status === 'Rejected'}
		Rejected
	{:else if status === 'Withdrawn'}
		Withdrawn
	{:else}
		Superseded
	{/if}
</Chip>
