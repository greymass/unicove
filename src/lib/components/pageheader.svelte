<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AccountButton from '$lib/components/button/account.svelte';
	import ContractButton from '$lib/components/button/contract.svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	import { type NetworkState } from '$lib/state/network.svelte';
	import { chainLogos } from '@wharfkit/common';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';

	interface Props {
		title: string;
		subtitle?: string;
		backPath?: string;
		network: NetworkState;
		contract?: boolean;
	}

	let props: Props = $props();

	function goBack() {
		if (props.backPath) {
			goto(props.backPath);
		} else {
			history.back();
		}
	}

	let logo = $derived(props.network.config.logo || '');

	let routePath = $derived(page.url.pathname.split('/')[3]);
	let contractPath = $derived(`/${props.network}/contract/${props.title}`);
	let accountPath = $derived(`/${props.network}/account/${props.title}`);
</script>

<header class="col-span-full flex min-h-16 items-center gap-4">
	{#if props.backPath}
		<button
			onclick={goBack}
			class="bg-mine-900 hover:bg-mine-800 grid size-12 place-items-center rounded-full text-sky-500 hover:text-sky-400"
		>
			<ChevronLeft size={24} />
		</button>
	{:else}
		<picture class="size-12">
			<img
				src={String(logo)}
				alt={String(props.network.chain.name)}
				class="size-full object-contain"
			/>
		</picture>
	{/if}

	<div class="grid gap-2">
		<h1 class="w-fit text-3xl leading-none font-bold text-white">
			<span>{props.title}</span>
			{#if routePath === 'account'}
				<CopyButton data={props.title} slop={false} />
				{#if props.contract}
					<ContractButton data={contractPath} slop={false} />
				{/if}
			{/if}

			{#if routePath === 'contract'}
				<CopyButton data={props.title} slop={false} />
				<AccountButton data={accountPath} slop={false} />
			{/if}
		</h1>
		{#if props.subtitle}
			<p class="text-muted text-base leading-none">{props.subtitle}</p>
		{/if}
	</div>
</header>
