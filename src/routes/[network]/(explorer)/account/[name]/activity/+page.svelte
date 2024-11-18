<script lang="ts">
	// import { goto } from '$app/navigation';
	// import { page } from '$app/stores';
	import Button from '$lib/components/button/button.svelte';
	// import Stack from '$lib/components/layout/stack.svelte';
	// import { onMount } from 'svelte';
	// import { ActivityLoader } from './state.svelte.js';
	// import type { ActivityActionWrapper } from '$lib/types.js';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();

	// console.log(data.json.activity);

	// const networkName = String(data.network);

	// onMount(async () => {
	// const loader = ActivityLoader.getInst(networkName);
	// loader.setAccount(String(data.name));
	// loader.load();
	// });

	// const activityLoader: ActivityLoader = $derived.by(() => {
	// 	return ActivityLoader.getInst(networkName);
	// });
	//
	// const isLoading = $derived.by(() => {
	// 	const scence = activityLoader.scene;
	// 	return scence.isLoading && !scence.list.length;
	// });
	//
	// const loadingText = $derived.by(() => {
	// 	const scence = activityLoader.scene;
	// 	if (!scence.hasMore) return 'No more';
	// 	if (scence.isLoading) return 'Loading';
	// 	return 'Load more';
	// });
	//
	// const activityActions: ActivityActionWrapper[] = $derived.by(() => {
	// 	const scence = activityLoader.scene;
	// 	return [...scence.list];
	// });
	//
	// function clickLoadMore() {
	// 	activityLoader.laodMore();
	// }

	// function more(next: string) {
	// 	let query = new URLSearchParams($page.url.searchParams.toString());
	// 	query.set('last', next);
	// 	goto(`?${query.toString()}`);
	// }
</script>

<!-- <Stack class="pb-8"> -->
<!-- {#await data.response} -->
<!-- 	<div class="flex items-center justify-center gap-4 py-20"> -->
<!-- 		<div class="bounce bounce-1 h-3 w-3 rounded-full bg-white"></div> -->
<!-- 		<div class="bounce bounce-2 h-3 w-3 rounded-full bg-white"></div> -->
<!-- 		<div class="bounce bounce-3 h-3 w-3 rounded-full bg-white"></div> -->
<!-- 	</div> -->
<!-- {:then response} -->
<!-- {#await response.json() then json} -->

{#if data.json.activity.last}
	<!-- {console.log(data.json.activity.last, data.json.activity.first)} -->
	<Button href="?start={data.json.activity.last}">next</Button>
	<!-- <Button onclick={() => more(data.json.activity.last)} variant="primary" -->
	<!-- 	>Last {data.json.activity.last}</Button -->
	<!-- > -->
	<!-- <Button onclick={() => more(data.json.activity.first)} variant="primary" -->
	<!-- 	>First {data.json.activity.first}</Button -->
	<!-- > -->
{/if}

{#each data.json.activity.actions as action}
	<p>
		{action.raw.account_action_seq}
	</p>
{/each}

<Code>
	{JSON.stringify(data.json, null, 2)}
</Code>

<!-- {#if data.json.activity.actions.length} -->
<!-- 	<div> -->
<!-- 		<div class="hidden border-b border-mineShaft-900 lg:flex lg:flex-row"> -->
<!-- 			<div class="grow-0 basis-[12%] px-2 py-3">ID</div> -->
<!-- 			<div class="grow-0 basis-[20%] px-2 py-3">Time</div> -->
<!-- 			<div class="grow-0 basis-[23%] px-2 py-3">Action</div> -->
<!-- 			<div class="grow-0 basis-[45%] px-2 py-3">Info</div> -->
<!-- 		</div> -->

<!-- 		{#each json.activity.actions as activityAction} -->
<!-- 			<div -->
<!-- 				class="text-muted box-border flex flex-col break-words border-b border-mineShaft-900 py-4 lg:flex-row" -->
<!-- 			> -->
<!-- 				<div -->
<!-- 					class="flex flex-1 gap-2 px-2 py-1 lg:max-w-[12%] lg:grow-0 lg:basis-[11%] lg:py-3" -->
<!-- 				> -->
<!-- 					<div class="block lg:hidden"> -->
<!-- 						<span class="text-white">ID:</span> -->
<!-- 					</div> -->
<!-- 					<a href="/{data.network}/transaction/{activityAction.id}" class="text-skyBlue-500" -->
<!-- 						>{activityAction.shortId}</a -->
<!-- 					> -->
<!-- 				</div> -->
<!-- 				<div -->
<!-- 					class="flex flex-1 gap-2 px-2 py-1 lg:max-w-[20%] lg:grow-0 lg:basis-[20%] lg:gap-0 lg:py-3" -->
<!-- 				> -->
<!-- 					<div class="block lg:hidden"> -->
<!-- 						<span class="text-white">Time:</span> -->
<!-- 					</div> -->
<!-- 					<div> -->
<!-- 						<span>{activityAction.date}&nbsp&nbsp{activityAction.timeInDay}</span> -->
<!-- 					</div> -->
<!-- 				</div> -->
<!-- 				<div -->
<!-- 					class="flex flex-1 break-all px-2 py-1 lg:max-w-[23%] lg:grow-0 lg:basis-[23%] lg:py-3" -->
<!-- 				> -->
<!-- 					<div> -->
<!-- 						<span -->
<!-- 							class="inline-block rounded px-3 py-0.5 {activityAction.actionStyle} text-white" -->
<!-- 							>{activityAction.actionName}</span -->
<!-- 						> -->
<!-- 					</div> -->
<!-- 				</div> -->
<!-- 				<div -->
<!-- 					class="flex flex-1 flex-col px-2 py-1 lg:max-w-[45%] lg:grow-0 lg:basis-[45%] lg:py-3" -->
<!-- 				> -->
<!-- 					<Code>{JSON.stringify(activityAction.actionData, null, 2)}</Code> -->
<!-- 				</div> -->
<!-- 			</div> -->
<!-- 		{/each} -->
<!-- 	</div> -->
<!-- 	<div class="flex items-center"> -->
<!-- 		<!-- <button <!-- onclick={clickLoadMore} --> --> -->
<!-- 		<!-- 	class="mx-auto min-w-32 border-2 border-shark-900/20 bg-skyBlue-500 px-5 py-3 text-center" -->
-->
<!-- 		<!-- 	> --> -->
<!-- 		<!-- 	<!-- {loadingText} --> --> -->
<!-- 		<!-- </button> --> -->
<!-- 	</div> -->
<!-- {/if} -->
