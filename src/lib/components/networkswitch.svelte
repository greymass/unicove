<script lang="ts">
	import { cn } from '$lib/utils/style';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { chainLogos } from '@wharfkit/common';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import FileQuestion from 'lucide-svelte/icons/file-question';
	import { createSelect, melt, type CreateSelectProps } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { chainMap } from '$lib/wharf/chains';
	import { goto } from '$app/navigation';
	import { languageTag } from '$lib/paraglide/runtime';
	import type { NetworkState } from '$lib/state/network.svelte';

	interface Props {
		currentNetwork: NetworkState;
		class?: string;
	}

	const context = getContext<UnicoveContext>('state');

	let currentSession = $derived(context.wharf.session);

	const { class: className, currentNetwork, ...props }: Props = $props();

	let logo = $derived(chainLogos.get(currentNetwork?.chain.id.toString()));

	let options = $derived(
		Object.entries(chainMap)
			.map(([chain_id, chain_name]) => ({
				value: chain_id,
				label: chain_name,
				logo: chainLogos.get(chain_id)
			}))
			.filter((c) => c.value !== String(currentNetwork?.chain.id))
	);

	const onSelectedChange: CreateSelectProps<string>['onSelectedChange'] = ({ next }) => {
		if (next !== undefined) goto(`/${languageTag()}/${next.label}`);
		return next;
	};

	const {
		elements: { trigger, menu, option, label },
		states: { open }
	} = createSelect<string>({
		forceVisible: true,
		onSelectedChange,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		}
	});
</script>

<button
	id="network-switcher"
	class={cn(
		'flex items-center gap-3 rounded-2xl px-4 py-3.5 hover:bg-mineShaft-950 focus:bg-mineShaft-950 focus:outline-none',
		className
	)}
	use:melt={$trigger}
	{...props}
>
	<picture class="flex size-10 justify-center">
		{#if logo}
			<img
				src={String(logo)}
				class="h-full object-contain"
				alt={String(currentSession?.chain.name)}
			/>
		{:else}
			<FileQuestion />
		{/if}
	</picture>

	<div class="grid flex-1 justify-items-start gap-0.5 md:gap-0">
		<span class="m-0 overflow-ellipsis text-xl font-bold leading-none md:text-2xl"
			>{currentNetwork.chain.name}</span
		>

		<div class="font-regular m-0 flex items-center gap-1 pr-1 text-base text-zinc-400">
			<span use:melt={$label}>Change network</span>
			<ChevronDown
				data-open={$open}
				class="size-4 transition-transform duration-100 data-[open=true]:rotate-180"
			/>
		</div>
	</div>
</button>

{#if $open}
	<div
		class="z-50 flex max-h-[300px] flex-col overflow-y-auto rounded-lg bg-mineShaft-950 p-1 shadow focus:!ring-0"
		use:melt={$menu}
		transition:fade={{ duration: 150 }}
	>
		{#each options as chain}
			<div
				class="
				relative flex h-12
				cursor-pointer items-center gap-2 rounded-lg
					px-4
					data-[highlighted]:bg-solar-200
					data-[highlighted]:text-solar-900
					data-[disabled]:opacity-50"
				use:melt={$option(chain)}
			>
				<picture class="flex size-6 items-center justify-center">
					{#if chain.logo}
						<img class="h-full object-contain" src={String(chain.logo)} alt={chain.label} />
					{:else}
						<FileQuestion class="size-4 text-zinc-400" />
					{/if}
				</picture>
				<span> {chain.label} </span>
			</div>
		{/each}
	</div>
{/if}
