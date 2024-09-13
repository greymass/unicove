<script lang="ts">
	import PageHeader from '$lib/components/pageheader.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';

	import ResourceWrapper from './components/overview/resources.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	import { ResourceType } from './types';
	import { ResourceState } from './state.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');

	const ramState = $state(new ResourceState(ResourceType.RAM));
	const cpuState = $state(new ResourceState(ResourceType.CPU));
	const netState = $state(new ResourceState(ResourceType.NET));

	$effect(() => {
		ramState.setResource(context.account?.ram);
		cpuState.setResource(context.account?.cpu);
		netState.setResource(context.account?.net);
	});

	const network = $derived(String(data.network));
</script>

<PageHeader title="Resources" />
<Stack class="mt-10">
	<Grid itemWidth="270px">
		<ResourceWrapper resourceState={ramState}>
			{#if context.network?.supports('rammarket')}
				<div class="flex flex-col">
					<Button class="text-blue-400" variant="pill" href="/{network}/ram/buy">BUY</Button>
					<Button class="text-blue-400" variant="pill" href="/{network}/ram/sell">SELL</Button>
				</div>
			{/if}
		</ResourceWrapper>
		<ResourceWrapper resourceState={cpuState}>
			{#if context.network?.supports('rentrex') || context.network?.supports('powerup')}
				<Button class="text-blue-400" variant="pill" href="/{network}/resources/cpu">RENT</Button>
			{/if}
			{#if context.network?.supports('stakeresource')}
				<Button class="text-blue-400" variant="pill" href="/{network}/resources/cpu/stake"
					>STAKE</Button
				>
			{/if}
		</ResourceWrapper>
		<ResourceWrapper resourceState={netState}>
			{#if context.network?.supports('rentrex') || context.network?.supports('powerup')}
				<Button class="text-blue-400" variant="pill" href="/{network}/resources/net">RENT</Button>
			{/if}
			{#if context.network?.supports('stakeresource')}
				<Button class="text-blue-400" variant="pill" href="/{network}/resources/net/stake"
					>STAKE</Button
				>
			{/if}
		</ResourceWrapper>
	</Grid>
</Stack>

<!-- <Code>{JSON.stringify(context, null, 2)}</Code> -->
