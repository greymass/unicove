<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import Grid from '$lib/components/layout/grid.svelte';
	import Button from '$lib/components/button/button.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	import { ResourceType } from '../../types.svelte';
	import { NetworkConfig } from '../../state.svelte';
	import { getName, getUnit } from '../../utils.svelte';

	interface Props {
		resource: ResourceType;
		powerupLink: string;
		rexLink: string;
		stakeLink: string;
	}

	const { resource, powerupLink, rexLink, stakeLink }: Props = $props();

	const resourceName = getName(resource);
	const resourceUnit = getUnit(resource);

	const networkConfig = $state(new NetworkConfig());
	$effect(() => {
		networkConfig.setConfig(context.network?.config);
	});

	const context = getContext<UnicoveContext>('state');
	let powerupPrice: Asset | undefined = $state();
	let rexPrice: Asset | undefined = $state();
	let stakingPrice: Asset | undefined = $state();

	$effect(() => {
		if (context.network) {
			powerupPrice = context.network.powerupprice;
			rexPrice = context.network.rexprice;
			stakingPrice = context.network.stakingprice;
		} else {
			powerupPrice = undefined;
			rexPrice = undefined;
			stakingPrice = undefined;
		}
	});
</script>

<div class="space-y-4 rounded-2xl border-2 border-slate-300 p-4">
	<h2 class="header">
		Resource Provider Costs for {resourceName}
	</h2>
	<h4 class="description">
		Select a Resource Provider from the choices below to increase your {resourceName}.
	</h4>

	<Grid>
		{#if networkConfig.hasPowerUp}
			<div class="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-300 p-4">
				<div>Power up</div>
				<div>
					{#if powerupPrice}
						{powerupPrice.value.toFixed(powerupPrice.symbol.precision)}
					{/if}
				</div>
				<div>
					{#if powerupPrice}
						{powerupPrice.symbol.code} per {resourceUnit.toUpperCase()}
					{/if}
				</div>
				<div class="text-center">Usable for up to <br /> 24 hours.</div>
				<Button variant="pill" class="text-blue-400" href={powerupLink}>Rent via PowerUp</Button>
			</div>
		{/if}
		{#if networkConfig.hasREX}
			<div class="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-300 p-4">
				<div>REX</div>
				<div>
					{#if rexPrice}
						{rexPrice.value.toFixed(rexPrice.symbol.precision)}
					{/if}
				</div>
				<div>
					{#if rexPrice}
						{rexPrice.symbol.code} per {resourceUnit.toUpperCase()}
					{/if}
				</div>
				<div class="text-center">Usable each day for <br />the next 30 days.</div>
				<Button variant="pill" class="text-blue-400" href={rexLink}>Rent via REX</Button>
			</div>
		{/if}
		{#if networkConfig.hasStaking}
			<div class="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-300 p-4">
				<div>Staking</div>
				<div>
					{#if stakingPrice}
						{(Number(stakingPrice.value) * 1000).toFixed(stakingPrice.symbol.precision)}
					{/if}
				</div>
				<div>
					{#if stakingPrice}
						{stakingPrice.symbol.code} per {resourceUnit.toUpperCase()}
					{/if}
				</div>
				<div class="text-center">Usable each day until <br />they are unstaked.</div>
				<Button variant="pill" class="text-blue-400" href={stakeLink}
					><span>Stake Tokens</span></Button
				>
			</div>
		{/if}
	</Grid>
</div>
