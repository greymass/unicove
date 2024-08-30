<script lang="ts">
	import Grid from '$lib/components/layout/grid.svelte';
	import Button from '$lib/components/button/button.svelte';
	interface Props {
		name: string;
		powerupLink: string;
		rexLink: string;
		stakeLink: string;
	}

	const { name, powerupLink, rexLink, stakeLink }: Props = $props();
</script>

<div class="space-y-4 rounded-2xl border-2 border-slate-300 p-4">
	<h2 class="header">Resource Provider Costs for {name}</h2>
	<h4 class="description">
		Select a Resource Provider from the choices below to increase your {name}.
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
			<div>price</div>
			<div>pair</div>
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
