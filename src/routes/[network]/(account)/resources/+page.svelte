<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import RamIcon from '$lib/assets/resources/ram.svg';
	import CpuIcon from '$lib/assets/resources/cpu.svg';
	import NetIcon from '$lib/assets/resources/net.svg';

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
				'Can be "powered up" by spending EOS.',
				'Some free services offer daily power-ups.',
				'Amount received is proportional to EOS spent.',
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
	const precision = 2;
	const network = $derived(String(data.network));
</script>

<div
	class="mx-auto flex flex-col gap-9 py-9 sm:gap-12 lg:mx-0 lg:flex-row lg:justify-between lg:gap-8"
>
	<Stack class="max-w-lg flex-1 gap-9">
		<Stack>
			<div class="flex gap-[1px]">
				<div class="relative h-[103px] flex-1 rounded-l-lg bg-[#303338]">
					<div class="absolute left-4 top-5">
						<img src={CpuIcon} class="size-6" alt="cpu icon" />
					</div>
					<div class="absolute right-3 top-3 text-xl font-bold">CPU</div>
					<div class="absolute bottom-2 right-3">
						<h5 class="h5 text-right">{cpuState.availableSize.toFixed(precision)} ms</h5>
						<p>Usage Available</p>
					</div>
				</div>
				<div class="relative h-[103px] flex-1 rounded-r-lg bg-[#303338]">
					<div class="absolute left-5 top-4">
						<img src={NetIcon} class="size-6" alt="cpu icon" />
					</div>
					<div class="absolute right-4 top-3 text-xl font-bold">NET</div>
					<div class="absolute bottom-2 right-4">
						<h5 class="h5 text-right">{netState.availableSize.toFixed(precision)} kb</h5>
						<p>Usage Available</p>
					</div>
				</div>
			</div>
			{#if context.network?.supports('powerup')}
				<Button variant="primary" href="/{network}/resources/cpu/powerup"
					>Rent resources with PowerUp</Button
				>
			{/if}
			{#if context.network?.supports('rentrex')}
				<Button variant="primary" href="/{network}/resources/cpu/rex"
					>Rent resources with REX</Button
				>
			{/if}
			{#if context.network?.supports('stakeresource')}
				<Button variant="primary" href="/{network}/resources/cpu/stake"
					>Stake EOS for resources</Button
				>
			{/if}
		</Stack>
		<Stack>
			<div class="relative h-[103px] rounded-lg bg-[#303338]">
				<div class="absolute left-4 top-3"><img src={RamIcon} class="size-6" alt="cpu icon" /></div>
				<div class="absolute right-3 top-3 text-xl font-bold">RAM</div>
				<div class="absolute bottom-2 right-3">
					<h5 class="h5 text-right">{ramState.availableSize.toFixed(precision)} kb</h5>
					<p>Usage Available</p>
				</div>
			</div>
			<Button variant="secondary" href="/{network}/ram">RAM Market</Button>
		</Stack>
	</Stack>
	<Stack class="max-w-lg flex-1 gap-4">
		<Stack class="gap-4 px-5 py-3">
			<h3 class="h3">EOS Resources: A Simple Explanation</h3>
			<p>
				The EOS blockchain uses three main resources: CPU, NET, and RAM. Users need these resources
				to interact with smart contracts and perform actions on the EOS blockchain. Managing these
				resources is crucial for efficient use of the EOS network.
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
