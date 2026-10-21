<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import VpStatusChip from '$lib/components/vp/VpStatusChip.svelte';
	import type { VpSibling, VpSiblings } from '$lib/vp/siblings';

	interface Props {
		siblings: VpSiblings;
	}

	const { siblings }: Props = $props();
	const context = getContext<UnicoveContext>('state');
</script>

{#snippet row(entry: VpSibling)}
	<span class="flex items-center gap-2">
		<span class="text-label-sm text-muted">{entry.vp}</span>
		{#if entry.relation === 'requires'}
			<span class="text-label-sm text-primary">Required</span>
		{:else if entry.relation === 'required-by'}
			<span class="text-label-sm text-primary">Depends on this</span>
		{:else if entry.relation === 'replaces'}
			<span class="text-label-sm text-primary">Replaced by this</span>
		{:else if entry.relation === 'superseded-by'}
			<span class="text-label-sm text-primary">Replaces this</span>
		{/if}
		<span class="ml-auto"><VpStatusChip status={entry.status} /></span>
	</span>
	<span class={['line-clamp-2 text-sm', !entry.current && 'group-hover:underline']}>
		{entry.title}
	</span>
{/snippet}

{#if siblings.entries.length > 1}
	<Card class="p-0">
		<nav aria-labelledby="vp-proposals-heading">
			<h2 id="vp-proposals-heading" class="text-label-sm text-muted px-4 pt-4 pb-2">Proposals</h2>
			<ul>
				{#each siblings.entries as entry (entry.vp)}
					<li>
						{#if entry.current}
							<div aria-current="page" class="bg-surface-container-high grid gap-1 px-4 py-2">
								{@render row(entry)}
							</div>
						{:else}
							<a
								href={context.urlPath(`/proposals/${entry.vp.toLowerCase()}`)}
								class="group hover:bg-surface-container grid gap-1 px-4 py-2 transition-colors"
							>
								{@render row(entry)}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
			<a
				href={context.urlPath('/proposals')}
				class="text-primary border-outline mx-4 mt-2 block border-t py-3 text-sm font-medium hover:underline"
			>
				View all proposals
			</a>
		</nav>
	</Card>
{/if}
