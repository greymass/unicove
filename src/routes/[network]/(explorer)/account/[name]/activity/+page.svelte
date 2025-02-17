<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import { onMount } from 'svelte';
	import { ActivityLoader } from './state.svelte.js';
	import type { ActivityActionWrapper } from '$lib/types/network';
	import Code from '$lib/components/code.svelte';
	import Transaction from '$lib/components/elements/transaction.svelte';
	import Button from '$lib/components/button/button.svelte';

	const { data } = $props();

	const networkName = String(data.network);

	onMount(() => {
		const loader = ActivityLoader.getInst(networkName);
		loader.setAccount(String(data.name));
		loader.load();
	});

	const activityLoader: ActivityLoader = $derived.by(() => {
		return ActivityLoader.getInst(networkName);
	});

	const isLoading = $derived.by(() => {
		const scence = activityLoader.scene;
		return scence.isLoading && !scence.list.length;
	});

	const hasMore = $derived(activityLoader.scene.hasMore);
	const loadingText = $derived.by(() => {
		const scence = activityLoader.scene;
		if (!scence.hasMore) return 'No more';
		if (scence.isLoading) return 'Loading';
		return 'Load more';
	});

	const activityActions: ActivityActionWrapper[] = $derived.by(() => {
		const scence = activityLoader.scene;
		return [...scence.list];
	});

	function clickLoadMore() {
		activityLoader.laodMore();
	}
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
			<div class="hidden border-b border-mineShaft-900 lg:flex lg:flex-row">
				<div class="grow-0 basis-[12%] px-2 py-3">ID</div>
				<div class="grow-0 basis-[20%] px-2 py-3">Time</div>
				<div class="grow-0 basis-[23%] px-2 py-3">Action</div>
				<div class="grow-0 basis-[45%] px-2 py-3">Info</div>
			</div>

			{#each activityActions as activityAction}
				<div
					class="text-muted box-border flex flex-col break-words border-b border-mineShaft-900 py-4 lg:flex-row"
				>
					<div class="flex flex-1 gap-2 px-2 py-1 lg:max-w-[12%] lg:grow-0 lg:basis-[11%] lg:py-3">
						<div class="block lg:hidden">
							<span class="text-white">ID:</span>
						</div>
						<Transaction id={activityAction.id} />
					</div>
					<div
						class="flex flex-1 gap-2 px-2 py-1 lg:max-w-[20%] lg:grow-0 lg:basis-[20%] lg:gap-0 lg:py-3"
					>
						<div class="block lg:hidden">
							<span class="text-white">Time:</span>
						</div>
						<div>
							<span>{activityAction.date}&nbsp&nbsp{activityAction.timeInDay}</span>
						</div>
					</div>
					<div
						class="flex flex-1 break-all px-2 py-1 lg:max-w-[23%] lg:grow-0 lg:basis-[23%] lg:py-3"
					>
						<div>
							<span class="inline-block rounded px-3 py-0.5 {activityAction.actionStyle} text-white"
								>{activityAction.actionName}</span
							>
						</div>
					</div>
					<div
						class="flex flex-1 flex-col px-2 py-1 lg:max-w-[45%] lg:grow-0 lg:basis-[45%] lg:py-3"
					>
						<Code>{JSON.stringify(activityAction.actionData, null, 2)}</Code>
					</div>
				</div>
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
