<script lang="ts">
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import { getContext } from 'svelte';
	import { chainLogos } from '@wharfkit/common';
	import { goto } from '$app/navigation';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		title: string;
		subtitle?: string;
		backPath?: string;
	}

	let props: Props = $props();

	function goBack() {
		if (props.backPath) {
			goto(props.backPath);
		} else {
			history.back();
		}
	}

	let logo = $derived(chainLogos.get(String(context.wharf.session?.chain.id)) || '');
</script>

<header class="flex items-center gap-4">
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
				alt={context.wharf.session.chain.name}
				class="size-full object-contain"
			/>
		</picture>
	{/if}

	<div class="grid gap-2">
		<h1 class="text-3xl font-bold leading-none text-white">{props.title}</h1>
		{#if props.subtitle}
			<h2 class="text-muted text-base leading-none">{props.subtitle}</h2>
		{/if}
	</div>
</header>
