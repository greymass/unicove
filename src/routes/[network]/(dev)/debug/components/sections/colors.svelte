<script lang="ts">
	import { Stack } from '$lib/components/layout';
	// import { cn } from '$lib/utils/style';

	// const values = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
</script>

<!-- {#snippet color(name: string, number: number)} -->
<!-- 	{@const background = `bg-${name}-${String(number)}`} -->
<!-- 	<div class={cn('size-20', background)}></div> -->
<!-- {/snippet} -->

<!-- {#snippet palette(name: string)} -->
<!-- 	<Cluster> -->
<!-- 		{#each values as value} -->
<!-- 			{@render color(name, value)} -->
<!-- 		{/each} -->
<!-- 	</Cluster> -->
<!-- {/snippet} -->

{#snippet roles(network: string, scheme?: string)}
	<div>
		<!-- <div class="mb-2 text-sm font-bold">{network}</div> -->
		<div class:light={scheme === 'light'} class=" flex flex-col gap-1" data-theme={network}>
			<div class="bg-primary min-h-20 p-4">
				<span class="text-on-primary font-bold">Primary</span>
			</div>
			<div class="bg-on-primary min-h-20 p-4">
				<span class="text-primary font-bold">On Primary</span>
			</div>
			<div class="bg-primary-container min-h-20 p-4">
				<span class="text-on-primary-container font-bold">Primary Container</span>
			</div>
			<div class="bg-on-primary-container min-h-20 p-4">
				<span class="text-primary-container font-bold">On Primary Container</span>
			</div>

			<div class="bg-background min-h-20 p-4">
				<span class="text-on-background font-bold">Background</span>
			</div>

			<div class="bg-surface p-4">
				<span class="text-on-surface col-span-full font-bold">Surface</span>
				<div class="flex *:flex-1">
					<div class="bg-on-surface min-h-20 p-4">
						<span class="text-surface font-bold">On Surface</span>
					</div>
					<div class="bg-on-surface-variant min-h-20 p-4">
						<span class="text-surface font-bold">On Surface Variant</span>
					</div>
					<div class="bg-surface-container-lowest min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface Container Lowest</span>
					</div>
					<div class="bg-surface-container-low min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface Container Low</span>
					</div>
					<div class="bg-surface-container min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface Container (Default)</span>
					</div>
					<div class="bg-surface-container-high min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface Container High</span>
					</div>
					<div class="bg-surface-container-highest min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface Container Highest</span>
					</div>
				</div>
			</div>
		</div>
	</div>
{/snippet}

<Stack id="colors" class="rounded-xl bg-black/10  p-6">
	<!-- <Cluster> -->
	<!-- 	{#each values as value} -->
	<!-- 		<span class="w-20 text-center">{String(value)}</span> -->
	<!-- 	{/each} -->
	<!-- </Cluster> -->
	<!---->
	<!-- {@render palette('red')} -->
	<!-- {@render palette('green')} -->
	<!-- {@render palette('mine')} -->
	<!-- {@render palette('shark')} -->
	<!-- {@render palette('zinc')} -->
	<!-- {@render palette('sky')} -->
	<!-- {@render palette('spring')} -->
	<!-- {@render palette('solar')} -->

	<h2 class="h2">Color Roles</h2>

	<div class="grid gap-4">
		{@render roles('eos')}
		<!-- {@render roles('jungle4')} -->
		<!-- {@render roles('vaulta')} -->
		<!-- {@render roles('telos')} -->
		<!-- {@render roles('wax')} -->
		<!-- {@render roles('kylin')} -->
	</div>
</Stack>
