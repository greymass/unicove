<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import CpuIcon from '$lib/assets/resources/cpu.svg';
	import NetIcon from '$lib/assets/resources/net.svg';
	import RamIcon from '$lib/assets/resources/ram.svg';
	import CpuAndNetResource from '$lib/components/elements/cpunetresource.svelte';
	import RamResource from '$lib/components/elements/ramresource.svelte';
	import { calAvailableSize } from '$lib/utils';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const cpuAvailableSize = $derived(calAvailableSize(context.account?.cpu));
	const netAvailableSize = $derived(calAvailableSize(context.account?.net));
	const ramAvailableSize = $derived(calAvailableSize(context.account?.ram));

	const network = String(data.network);
	const chainName = data.network.chain.name;
	const symbolName = data.network.chain.systemToken?.symbol.name || 'token';
	const precision = 2;

	const explanations = [
		{
			icon: CpuIcon,
			name: 'CPU',
			title: 'CPU (Central Processing Unit)',
			descriptions: [
				'Provides processing power for blockchain actions.',
				'Measured in microseconds.',
				'Needed to execute transactions.'
			]
		},
		{
			icon: NetIcon,
			name: 'NET',
			title: 'NET (Network Bandwidth)',
			descriptions: [
				'Represents network bandwidth usage.',
				'Required for transactions on the blockchain.'
			]
		},
		{
			icon: '',
			name: 'CPU and NET',
			title: 'CPU and NET',
			descriptions: [
				`Can be "powered up" by spending ${symbolName}.`,
				'Some free services offer daily power-ups.',
				`Amount received is proportional to ${symbolName} spent.`,
				'Lasts for a specific time period.'
			]
		},
		{
			icon: RamIcon,
			name: 'RAM',
			title: 'RAM (Random Access Memory)',
			descriptions: [
				"It's like computer memory, but for the blockchain.",
				'Used to store data on the blockchain.',
				'Limited and in high demand.',
				'Can be bought and sold by users.',
				'Price changes based on availability.'
			]
		}
	];
</script>

<div
	class="mx-auto flex flex-col gap-9 py-5 sm:gap-12 lg:mx-0 lg:flex-row lg:justify-between lg:gap-8"
>
	<Stack class="max-w-lg flex-1 gap-9">
		<Stack>
			<CpuAndNetResource
				cpuAvailable={cpuAvailableSize}
				netAvailable={netAvailableSize}
				{precision}
			/>
			{#if data.network.supports('powerup')}
				<Button variant="primary" href="/{network}/resources/powerup"
					>Rent resources with PowerUp</Button
				>
			{/if}
			{#if data.network.supports('rentrex')}
				<Button variant="primary" href="/{network}/resources/rex">Rent resources with REX</Button>
			{/if}
			{#if data.network.supports('stakeresource')}
				<Button variant="primary" href="/{network}/resources/stake"
					>Stake {symbolName} for resources</Button
				>
			{/if}
		</Stack>
		<Stack>
			<RamResource ramAvailable={ramAvailableSize} {precision} />
			<Button variant="secondary" href="/{network}/ram">RAM Market</Button>
		</Stack>
	</Stack>
	<Stack class="max-w-lg flex-1 gap-4">
		<Stack class="gap-4 px-5 py-3">
			<h3 class="h3">{chainName} Resources: A Simple Explanation</h3>
			<p>
				The {chainName} blockchain uses three main resources: CPU, NET, and RAM. Users need these resources
				to interact with smart contracts and perform actions on the {chainName} blockchain. Managing
				these resources is crucial for efficient use of the
				{chainName} network.
			</p>
		</Stack>
		<ul class="space-y-0 lg:space-y-4">
			{#each explanations as explanation}
				<li class="grid grid-cols-[25%_75%]">
					<div class="flex justify-center pl-5 pt-5">
						{#if explanation.icon}
							<img src={explanation.icon} class="size-6" alt={`${explanation.name} icon`} />
						{/if}
					</div>
					<div class="space-y-4 px-5 py-3">
						<h3 class="h5 text-white">{explanation.title}</h3>
						<ul class="space-y-1">
							{#each explanation.descriptions as desc}
								<li>- {desc}</li>
							{/each}
						</ul>
					</div>
				</li>
			{/each}
		</ul>
	</Stack>
</div>
