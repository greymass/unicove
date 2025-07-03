<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { Name } from '@wharfkit/antelope';

	import { ActivityLoader } from './state.svelte.js';
	import { getActionSummaryComponent } from '$lib/components/summary/index.js';
	import {Button} from 'unicove-components';
	import SelectActionVariant from '$lib/components/select/actionvariant.svelte';
	import Trace from '$lib/components/elements/trace.svelte';
	import type { ActionDisplayVariants } from '$lib/types.js';
	import type { ActivityResponseAction } from '$lib/types/transaction.js';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import Stack from '$lib/components/layout/stack.svelte';
	import NameInput from '$lib/components/input/name.svelte';

	const { data } = $props();

	const networkName = String(data.network);
	const context = getContext<UnicoveContext>('state');

	onMount(() => {
		const loader = ActivityLoader.getInst(networkName, data.network.fetch);
		loader.setAccount(String(data.name));
		loader.setContract(String(contractFilter));
		loader.setAction(String(actionFilter));
		loader.load();
	});

	const activityLoader: ActivityLoader = $derived.by(() => {
		return ActivityLoader.getInst(networkName, data.network.fetch);
	});

	const isLoading = $derived.by(() => {
		const scene = activityLoader.scene;
		return scene.isLoading && !scene.list.length;
	});

	const hasMore = $derived(activityLoader.scene.hasMore);
	const loadingText = $derived.by(() => {
		const scene = activityLoader.scene;
		if (!scene.hasMore) return 'No more';
		if (scene.isLoading) return 'Loading';
		return 'Load more';
	});

	const activityActions: ActivityResponseAction[] = $derived.by(() => {
		return [...activityLoader.scene.list];
	});

	function clickLoadMore() {
		activityLoader.loadMore();
	}

	let variant = $derived(context.settings.data.actionDisplayVariant as ActionDisplayVariants);

	let contractInput: NameInput | undefined = $state();
	let contractRef: HTMLInputElement | undefined = $state();
	let contractValid = $state(false);
	let contractFilter = $state(Name.from(''));

	let actionInput: NameInput | undefined = $state();
	let actionRef: HTMLInputElement | undefined = $state();
	let actionValid = $state(false);
	let actionFilter = $state(Name.from(''));

	function filter() {
		activityLoader.scene.reset();
		activityLoader.setAccount(String(data.name));
		activityLoader.setContract(String(contractFilter));
		activityLoader.setAction(String(actionFilter));
		activityLoader.load();
	}
</script>

<Stack class="py-4">
	{#if isLoading}
		<div class="flex items-center justify-center gap-4 py-20">
			<div class="bounce bounce-1 h-3 w-3 rounded-full bg-white"></div>
			<div class="bounce bounce-2 h-3 w-3 rounded-full bg-white"></div>
			<div class="bounce bounce-3 h-3 w-3 rounded-full bg-white"></div>
		</div>
	{/if}
	{#if data.network.supports('hyperion')}
		<div class="flex gap-2">
			<NameInput
				class="flex-1"
				bind:this={contractInput}
				bind:ref={contractRef}
				bind:value={contractFilter}
				bind:valid={contractValid}
				id="contract-input"
				placeholder="Contract"
			/>
			<NameInput
				class="flex-1"
				bind:this={actionInput}
				bind:ref={actionRef}
				bind:value={actionFilter}
				bind:valid={actionValid}
				placeholder="Action"
			/>
			<Button class="max-w-32 flex-0" onclick={filter}>Filter</Button>
		</div>
	{/if}
	{#if activityActions.length}
		<SelectActionVariant />
		<ol class="grid gap-12">
			{#each activityActions as activityAction}
				{@const contract = String(activityAction.trace.action.account)}
				{@const action = String(activityAction.trace.action.name)}
				{@const summary = getActionSummaryComponent(
					contract,
					action,
					activityAction.trace.act.data
				)}
				<li class="">
					<Trace
						perspectiveOf={Name.from(data.name)}
						trace={activityAction.trace}
						{summary}
						date
						trxid
						{variant}
					/>
				</li>
			{/each}
		</ol>

		{#if hasMore}
			<Button onclick={clickLoadMore} variant="primary" class="place-self-center">
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
