<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import IconButton from './button/icon.svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	import { type NetworkState } from '$lib/state/network.svelte';
	import { Code, User } from 'lucide-svelte';
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
		<IconButton
			size="large"
			variant="filled"
			class="text-primary"
			onclick={goBack}
			icon={ChevronLeft}
		/>
	{:else}
		<picture class="size-12">
			<img
				src={String(logo)}
				alt={String(props.network.chain.name)}
				class="size-full object-contain"
			/>
		</picture>
	{/if}

	<div class="">
		<div class="text-primary flex h-fit w-fit items-center">
			<h1 class="text-on-surface mb-2 text-3xl leading-none font-bold">{props.title}</h1>
			{#if routePath === 'account'}
				<CopyButton data={props.title} hideBackground />
				{#if props.contract}
					<IconButton icon={Code} href={contractPath} hideBackground />
				{/if}
			{/if}

			{#if routePath === 'contract'}
				<CopyButton data={props.title} hideBackground />
				<IconButton icon={User} href={accountPath} hideBackground />
			{/if}
		</div>

		{#if props.subtitle}
			<p class="text-muted text-base leading-none">{props.subtitle}</p>
		{/if}
	</div>
</header>
