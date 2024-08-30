<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import Grid from '$lib/components/layout/grid.svelte';
	import Button from '$lib/components/button/button.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	import { ResourceType } from '../../types.svelte';

	interface Props {
		resource: ResourceType;
		powerupLink: string;
		rexLink: string;
		stakeLink: string;
	}

	const { resource, powerupLink, rexLink, stakeLink }: Props = $props();

	const resourceName = resource === ResourceType.CPU ? 'CPU' : 'NET';
	const resourceUnit = resource === ResourceType.CPU ? 'ms' : 'kb';

	const context = getContext<UnicoveContext>('state');
	let rexPrice: Asset | undefined = $state();

	$effect(() => {
		if (context.network) {
			rexPrice = context.network.rexprice;
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
		<div class="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-300 p-4">
			<div>Power up</div>
			<div>price</div>
			<div>pair</div>
			<div class="text-center">Usable for up to <br /> 24 hours.</div>
			<Button variant="pill" class="text-blue-400" href={powerupLink}>Rent via PowerUp</Button>
		</div>
		<div class="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-300 p-4">
			<div>REX</div>
			<div>{rexPrice?.value}</div>
			<div>{rexPrice?.symbol.code} per 1{resourceUnit.toUpperCase()}</div>
			<div class="text-center">Usable each day for <br />the next 30 days.</div>
			<Button variant="pill" class="text-blue-400" href={rexLink}>Rent via REX</Button>
		</div>
		<div class="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-300 p-4">
			<div>Staking</div>
			<div>price</div>
			<div>pair</div>
			<div class="text-center">Usable each day until <br />they are unstaked.</div>
			<Button variant="pill" class="text-blue-400" href={stakeLink}
				><span>Stake Tokens</span></Button
			>
		</div>
	</Grid>
</div>
