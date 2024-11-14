<script lang="ts">
	import Center from '$lib/components/layout/center.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import { untrack } from 'svelte';
	import { ActivityLoader } from './state.svelte.js';
	import type { ActivityActionWrapper } from '$lib/types.js';
	import Code from '$lib/components/code.svelte';
	import Card from '$lib/components/layout/box/card.svelte';

	const { data } = $props();

	const networkName = String(data.network);

	const activityLoader: ActivityLoader = $derived.by(() => {
		const loader = ActivityLoader.getInst(networkName);
		const currentAccount = String(data.name);
		untrack(() => {
			loader.setAccount(currentAccount);
			loader.load();
		});
		return loader;
	});

	const isLoading = $derived.by(() => {
		const scence = activityLoader.scene;
		return scence.isLoading && scence.list.length === 0;
	});

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
		<div class="flex gap-4 py-20 items-center justify-center">
			<div class="bounce bounce-1 h-3 w-3 rounded-full bg-white"></div>
			<div class="bounce bounce-2 h-3 w-3 rounded-full bg-white"></div>
			<div class="bounce bounce-3 h-3 w-3 rounded-full bg-white"></div>
		</div>
	{/if}
	{#if activityActions.length}
		<div>
			<div class="hidden border-b border-mineShaft-900 lg:flex lg:flex-row">
				<div class="grow-0 basis-[15%] px-2 py-3">ID</div>
				<div class="grow-0 basis-[22%] px-2 py-3">Time</div>
				<div class="grow-0 basis-[25%] px-2 py-3">Action</div>
				<div class="grow-0 basis-[38%] px-2 py-3">Info</div>
			</div>

			{#each activityActions as activityAction}
				<div
					class="text-muted box-border flex flex-col break-words border-b border-mineShaft-900 py-4 lg:flex-row"
				>
					<div class="flex flex-1 gap-2 px-2 py-1 lg:max-w-[15%] lg:grow-0 lg:basis-[15%] lg:py-3">
						<div class="block lg:hidden">
							<span class="text-white">ID:</span>
						</div>
						<a href="/{data.network}/transaction/{activityAction.id}" class="text-skyBlue-500"
							>{activityAction.shortId}</a
						>
					</div>
					<div
						class="flex flex-1 gap-2 px-2 py-1 lg:max-w-[22%] lg:grow-0 lg:basis-[22%] lg:gap-0 lg:py-3"
					>
						<div class="block lg:hidden">
							<span class="text-white">Time:</span>
						</div>
						<div>
							<span>{activityAction.date}&nbsp&nbsp{activityAction.timeInDay}</span>
						</div>
					</div>
					<div
						class="flex flex-1 break-all px-2 py-1 lg:max-w-[25%] lg:grow-0 lg:basis-[25%] lg:py-3"
					>
						<div>
							{@html activityAction.actionName}
						</div>
					</div>
					<div
						class="flex flex-1 flex-col px-2 py-1 lg:max-w-[38%] lg:grow-0 lg:basis-[38%] lg:py-3"
					>
						{#if activityAction.actionData.explanation}
							<div>
								{@html activityAction.actionData.explanation}
							</div>
							{#if activityAction.actionData.memo}
								<div>
									<span class="text-sm">Memo: {activityAction.actionData.memo}</span>
								</div>
							{/if}
						{:else}
							<Code>{JSON.stringify(activityAction.actionData.json, null, 2)}</Code>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		<div class="flex items-center">
			<a
				onclick={clickLoadMore}
				class="mx-auto min-w-32 border-2 border-shark-900/20 bg-skyBlue-500 px-5 py-3 text-center"
			>
				{loadingText}
			</a>
		</div>
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
