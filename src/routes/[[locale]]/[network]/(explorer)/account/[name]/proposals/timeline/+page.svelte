<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button, Stack } from 'unicove-components';

	import ActivityEvent from '../components/ActivityEvent.svelte';
	import ActionTypeFilter from '../components/ActionTypeFilter.svelte';
	import EmptyState from '../components/EmptyState.svelte';

	const { data } = $props();

	const activity = $derived(data.activity);
	const hasMore = $derived(data.more);
	const currentActionType = $derived(data.actionType);

	function handleActionTypeChange(actionType: string) {
		const url = new URL($page.url);
		url.searchParams.set('action_type', actionType);
		url.searchParams.delete('offset');
		goto(url.toString());
	}

	function loadMore() {
		const url = new URL($page.url);
		const newOffset = (data.offset || 0) + (data.limit || 20);
		url.searchParams.set('offset', String(newOffset));
		goto(url.toString());
	}
</script>

<Stack class="gap-4">
	<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<h2 class="text-title">Multisig Activity Timeline</h2>
		<ActionTypeFilter value={currentActionType} onchange={handleActionTypeChange} />
	</div>

	{#if data.error}
		<div class="text-error">Failed to load activity: {data.error}</div>
	{:else if activity.length === 0}
		<EmptyState
			title="No activity found"
			message={currentActionType === 'all'
				? 'This account has no multisig activity yet'
				: `No ${currentActionType} actions found`}
		/>
	{:else}
		<div class="grid gap-4">
			{#each activity as event}
				<ActivityEvent {event} />
			{/each}
		</div>

		{#if hasMore}
			<Button onclick={loadMore} variant="secondary" class="place-self-center">Load More</Button>
		{/if}

		<p class="text-muted text-center text-sm">
			Showing {activity.length} of {data.total} total events
		</p>
	{/if}
</Stack>
