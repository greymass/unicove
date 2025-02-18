<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import { onMount } from 'svelte';
	import { ActivityLoader } from './state.svelte.js';
	import Button from '$lib/components/button/button.svelte';
	import Action from '$lib/components/elements/action.svelte';
	import type { ActivityResponseAction } from '$lib/types/transaction.js';
	import type { ActionDisplayVariants } from '$lib/types.js';

	const { data } = $props();

	const networkName = String(data.network);

	onMount(() => {
		const loader = ActivityLoader.getInst(networkName, data.network.fetch);
		loader.setAccount(String(data.name));
		loader.load();
	});

	const activityLoader: ActivityLoader = $derived.by(() => {
		return ActivityLoader.getInst(networkName, data.network.fetch);
	});

	const isLoading = $derived.by(() => {
		const scence = activityLoader.scene;
		return scence.isLoading && !scence.list.length;
	});

	$inspect(JSON.stringify(activityLoader));
	const hasMore = $derived(activityLoader.scene.hasMore);
	const loadingText = $derived.by(() => {
		const scence = activityLoader.scene;
		if (!scence.hasMore) return 'No more';
		if (scence.isLoading) return 'Loading';
		return 'Load more';
	});

	const activityActions: ActivityResponseAction[] = $derived.by(() => {
		const scence = activityLoader.scene;
		return [...scence.list];
	});

	function clickLoadMore() {
		activityLoader.loadMore();
	}

	let variant: ActionDisplayVariants = $state('json');
</script>

<Stack class="pb-8">
	{#if isLoading}
		<div class="flex items-center justify-center gap-4 py-20">
			<div class="bounce bounce-1 h-3 w-3 rounded-full bg-white"></div>
			<div class="bounce bounce-2 h-3 w-3 rounded-full bg-white"></div>
			<div class="bounce bounce-3 h-3 w-3 rounded-full bg-white"></div>
		</div>
	{/if}
	{#if activityActions.length}
		<div>
			{#each activityActions as activityAction}
				<Action action={activityAction.action} id={activityAction.action_trace.trx_id} {variant} />
			{/each}
		</div>

		{#if hasMore}
			<Button onclick={clickLoadMore} variant="primary" class="">
				{loadingText}
			</Button>
		{/if}
	{/if}
</Stack>

<style>
	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10px);
		}
		60% {
			transform: translateY(-5px);
		}
	}

	.bounce {
		animation: bounce 1.4s infinite ease-in-out;
	}

	.bounce-1 {
		animation-delay: 0s;
	}

	.bounce-2 {
		animation-delay: 0.2s;
	}

	.bounce-3 {
		animation-delay: 0.4s;
	}
</style>
