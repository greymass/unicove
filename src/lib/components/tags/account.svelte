<script lang="ts">
	import { FileBadge2, BadgeCheck, BadgeHelp, BadgeDollarSign } from 'lucide-svelte';
	import Tooltip from '$lib/components/tooltip/tooltip.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { MetaTag } from '$lib/types/meta';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		tags?: MetaTag[];
		network: NetworkState;
	}

	let props: Props = $props();
</script>

{#if props.tags}
	{#each props.tags as tag}
		{#if tag.tag.equals('system')}
			<Tooltip
				content={m.toolitp_network_contract({ network: props.network.chain.name })}
				icon={FileBadge2}
			>
				<FileBadge2 class={cn('text-solar-500', props.class)} />
			</Tooltip>
		{:else if tag.tag.equals('network')}
			<Tooltip content={m.tooltip_network_account()} icon={BadgeCheck}>
				<BadgeCheck class={cn('text-solar-500', props.class)} />
			</Tooltip>
		{:else if tag.tag.equals('exchange')}
			<Tooltip content={m.tooltip_exchange_account()} icon={BadgeDollarSign}>
				<BadgeDollarSign class={cn('text-solar-500', props.class)} />
			</Tooltip>
		{:else}
			<Tooltip content={m.tooltip_tagged_account({ tag: tag.tag })} icon={BadgeHelp}>
				<BadgeHelp class={cn('text-solar-500', props.class)} />
			</Tooltip>
		{/if}
	{/each}
{/if}
