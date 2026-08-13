<script lang="ts">
	import { getContext } from 'svelte';
	import { Chip } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { VpMsigCardModel } from '$lib/vp/onchain';

	interface Props {
		model: VpMsigCardModel;
	}

	const { model }: Props = $props();
	const context = getContext<UnicoveContext>('state');
</script>

<div class="flex flex-wrap items-center gap-2 text-sm">
	<a class="text-primary hover:underline" href={context.urlPath(model.msigPath)}>
		{model.proposer}/{model.proposal}
	</a>
	<Chip>
		{#if model.status === 'executed'}
			Executed
		{:else if model.status === 'expired'}
			Expired
		{:else}
			Cancelled
		{/if}
	</Chip>
	{#if model.txPath}
		<a class="text-primary hover:underline" href={context.urlPath(model.txPath)}>
			View the executed transaction
		</a>
	{/if}
</div>
