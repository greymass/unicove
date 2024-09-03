<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import PageHeader from '$lib/components/pageheader.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';

	import ResourceWrapper from './components/overview/resources.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	import { NetworkConfig } from './state.svelte';
	import { calSize, calUsagePer } from './utils.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');

	const cpuAvailableSize = $derived(calSize(Number(context.account?.cpu?.available)));
	const cpuUsagePerc = $derived(
		calUsagePer(Number(context.account?.cpu?.used), Number(context.account?.cpu?.max))
	);

	const ramAvailableSize = $derived(calSize(Number(context.account?.ram?.available)));
	const ramUsagePerc = $derived(
		calUsagePer(Number(context.account?.ram?.used), Number(context.account?.ram?.max))
	);

	const netAvailableSize = $derived(calSize(Number(context.account?.net?.available)));
	const netUsagePerc = $derived(
		calUsagePer(Number(context.account?.net?.used), Number(context.account?.net?.max))
	);

	const networkConfig = $state(new NetworkConfig());
	$effect(() => {
		networkConfig.setConfig(context.network?.config);
	});

	const network = $derived(String(data.network));
</script>

<PageHeader title="Resources" />
<Stack class="mt-10">
	<Grid itemWidth="270px">
		<ResourceWrapper
			title="ram"
			size="{ramAvailableSize}kb"
			used="{ramUsagePerc}% Quota used"
			percentage={ramUsagePerc}
		>
			{#if networkConfig.hasBuyRAM}
				<div class="flex flex-col">
					<Button class="text-blue-400" variant="pill" href="/{network}/ram/buy">BUY</Button>
					<Button class="text-blue-400" variant="pill" href="/{network}/ram/sell">SELL</Button>
				</div>
			{/if}
		</ResourceWrapper>
		<ResourceWrapper
			title="cpu"
			size="{cpuAvailableSize}ms"
			used="{cpuUsagePerc}% Quota used"
			percentage={cpuUsagePerc}
		>
			{#if networkConfig.hasREX || networkConfig.hasPowerUp}
				<Button class="text-blue-400" variant="pill" href="/{network}/resources/cpu">RENT</Button>
			{:else if networkConfig.hasStaking}
				<Button class="text-blue-400" variant="pill" href="/{network}/resources/cpu/stake"
					>STAKE</Button
				>
			{/if}
		</ResourceWrapper>
		<ResourceWrapper
			title="net"
			size="{netAvailableSize}kb"
			used="{netUsagePerc}% Quota used"
			percentage={netUsagePerc}
		>
			{#if networkConfig.hasREX || networkConfig.hasPowerUp}
				<Button class="text-blue-400" variant="pill" href="/{network}/resources/net">RENT</Button>
			{:else if networkConfig.hasStaking}
				<Button class="text-blue-400" variant="pill" href="/{network}/resources/net/stake"
					>STAKE</Button
				>
			{/if}
		</ResourceWrapper>
	</Grid>
</Stack>

<!-- <Code>{JSON.stringify(context, null, 2)}</Code> -->
