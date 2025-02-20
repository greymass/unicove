<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AccountButton from '$lib/components/button/account.svelte';
	import CodeButton from '$lib/components/button/code.svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	import { languageTag } from '$lib/paraglide/runtime';
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

	let logo = $derived(chainLogos.get(String(props.network.chain.id)) || '');

	let routePath = $derived(page.url.pathname.split('/')[3]);
	let contractPath = $derived(
		`${languageTag()}/${props.network.shortname}/contract/${props.title}`
	);
	let accountPath = $derived(`${languageTag()}/${props.network.shortname}/account/${props.title}`);
</script>

<header class="col-span-full flex min-h-16 items-center gap-4">
	{#if props.backPath}
		<button
			onclick={goBack}
			class="grid size-12 place-items-center rounded-full bg-mineShaft-900 text-skyBlue-500 hover:bg-mineShaft-800 hover:text-skyBlue-400"
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
		<h1 class="w-fit text-3xl font-bold leading-none text-white">
			<span>{props.title}</span>
			{#if routePath === 'account'}
				<CopyButton data={props.title} slop={false} />
				{#if props.contract}
					<CodeButton data={contractPath} slop={false} />
				{/if}
			{/if}
			{#if routePath === 'contract'}
				<AccountButton data={accountPath} slop={false} />
			{/if}
		</h1>
		{#if props.subtitle}
			<p class="text-muted text-base leading-none">{props.subtitle}</p>
		{/if}
	</div>
</header>
