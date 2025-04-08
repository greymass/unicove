<script lang="ts">
	import { getContext } from 'svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';

	import { Card, Stack } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import Chip from '$lib/components/chip.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import * as m from '$lib/paraglide/messages';

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	interface Props {
		cta?: {
			label: string;
			href: string;
		};
		title?: string;
	}

	const { cta, title = m.common_account_balance() }: Props = $props();
</script>

<Card {title}>
	<Stack>
		<Stack class="gap-2">
			<h4 class="text-muted text-base leading-none">{m.common_available()}</h4>
			<p class="text-on-surface text-xl leading-none font-semibold">
				{#if context.account}
					<AssetText variant="full" value={context.account?.balance?.balance} />
				{:else}
					{m.common_not_logged_in()}
				{/if}
			</p>
			{#if market.account?.systemtoken?.liquid}
				<Chip>
					<AssetText variant="full" value={market.account?.systemtoken?.liquid} />
				</Chip>
			{/if}
		</Stack>

		{#if cta}
			<Stack class="gap-2">
				<Button href={cta.href}>{cta.label}</Button>
			</Stack>
		{/if}
	</Stack>
</Card>
