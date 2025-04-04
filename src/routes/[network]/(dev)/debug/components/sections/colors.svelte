<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import Cluster from '$lib/components/layout/cluster.svelte';
	import { cn } from '$lib/utils/style';

	const values = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
</script>

{#snippet color(name: string, number: number)}
	{@const background = `bg-${name}-${String(number)}`}
	<div class={cn('size-20', background)}></div>
{/snippet}

{#snippet palette(name: string)}
	<Cluster>
		{#each values as value}
			{@render color(name, value)}
		{/each}
	</Cluster>
{/snippet}

{#snippet roles(network: string)}
	<div>
		<div class="mb-2 text-sm">{network}</div>
		<div class="flex flex-col gap-1" data-theme={network}>
			<div class="bg-primary h-20 p-4">
				<span class="text-on-primary font-bold">Primary</span>
			</div>
			<div class="bg-on-primary h-20 p-4">
				<span class="text-primary font-bold">On Primary</span>
			</div>
			<div class="bg-primary-container h-20 p-4">
				<span class="text-on-primary-container font-bold">Primary Container</span>
			</div>
			<div class="bg-on-primary-container h-20 p-4">
				<span class="text-primary-container font-bold">On Primary Container</span>
			</div>
		</div>
	</div>
{/snippet}

<Stack id="colors" class="rounded-xl bg-black/10  p-6">
	<h2 class="h2">Colors</h2>
	<Cluster>
		{#each values as value}
			<span class="w-20 text-center">{String(value)}</span>
		{/each}
	</Cluster>

	{@render palette('red')}
	{@render palette('green')}
	{@render palette('mine')}
	{@render palette('shark')}
	{@render palette('zinc')}
	{@render palette('sky')}
	{@render palette('spring')}
	{@render palette('solar')}

	<h2 class="h2">Roles</h2>
	<div class="flex gap-4">
		{@render roles('eos')}
		{@render roles('jungle4')}
	</div>
</Stack>
