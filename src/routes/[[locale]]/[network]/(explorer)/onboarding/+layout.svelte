<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import { Stack } from '@wharfkit/svelte-components';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import Empty from '$lib/components/onboarding/empty.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { CreationindexClient } from '$lib/state/creationindex/client';
	import { GiftProgram } from '$lib/state/creationindex/giftprogram.svelte';
	import { giftcontract } from '$lib/wharf/chains';

	const { children } = $props();
	const context = getContext<UnicoveContext>('state');

	const supported = context.network.supports('giftprogram') && !!giftcontract;
	const program = new GiftProgram(
		String(giftcontract ?? ''),
		new CreationindexClient(context.urlPath('/api/creationindex')),
		context.network.client
	);
	setContext('giftprogram', program);
	if (supported) program.load();

	const tabs = [
		{ href: context.urlPath('/onboarding'), text: 'Overview' },
		{ href: context.urlPath('/onboarding/creators'), text: 'Creators' },
		{ href: context.urlPath('/onboarding/events'), text: 'Events' },
		{ href: context.urlPath('/onboarding/manage'), text: 'Manage' }
	];
</script>

<Stack class="gap-6">
	{#if !supported}
		<p class="text-muted">Network-funded onboarding is unavailable on this network.</p>
	{:else if program.loading}
		<p class="text-muted animate-pulse">Loading the gift program...</p>
	{:else if program.failed}
		<p class="text-error">The gift program's figures are unavailable right now.</p>
	{:else if !program.exists}
		<Empty contract={program.contract} />
	{:else}
		<PillGroup options={tabs} />
		{@render children?.()}
	{/if}
</Stack>
