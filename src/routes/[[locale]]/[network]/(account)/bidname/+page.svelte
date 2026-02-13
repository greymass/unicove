<script lang="ts">
	import { getContext } from 'svelte';

	import { MultiCard } from '$lib/components/layout';
	import { Card } from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { BidnameState } from '$lib/state/bidname.svelte';
	import AuctionHero from './components/auction-hero.svelte';
	import BidList from './components/bid-list.svelte';
	import BidSearch from './components/bid-search.svelte';
	import YourBids from './components/your-bids.svelte';

	const REFRESH_INTERVAL = 30_000;

	const context = getContext<UnicoveContext>('state');

	const { data } = $props();

	const bidnameState = new BidnameState(data.network);

	let refreshBids: (() => void) | undefined;
	let syncBids: (() => void) | undefined;

	function refresh() {
		bidnameState.fetchTopBids();
		refreshBids?.();
	}

	$effect(() => {
		if (data.network) {
			bidnameState.fetchTopBids();
		}
	});

	$effect(() => {
		const interval = setInterval(refresh, REFRESH_INTERVAL);
		return () => clearInterval(interval);
	});
</script>

{#if data.network.supports('bidname')}
	<MultiCard>
		{#snippet leftColumn()}
			<AuctionHero
				bid={bidnameState.leadingBid}
				lastNameClose={bidnameState.lastNameClose}
				network={data.network}
				urlPath={context.urlPath}
				onexpire={refresh}
			/>

			<Card id="top-bids" title="Top Active Bids">
				<BidList
					bids={bidnameState.topBids}
					loading={bidnameState.loading}
					network={data.network}
					urlPath={context.urlPath}
				/>
			</Card>
		{/snippet}

		{#snippet rightColumn()}
			<Card id="search" title="Search Names">
				<BidSearch
					network={data.network}
					urlPath={context.urlPath}
					accountName={context.account ? String(context.account.name) : undefined}
					ontrackchange={() => syncBids?.()}
				/>
			</Card>

			{#if context.account}
				<YourBids
					accountName={String(context.account.name)}
					network={data.network}
					urlPath={context.urlPath}
					onrefresh={(fn) => (refreshBids = fn)}
					ontrackchange={(fn) => (syncBids = fn)}
				/>
			{/if}
		{/snippet}
	</MultiCard>
{:else}
	<p>Premium name bidding is not available on {data.network.chain.name}.</p>
{/if}
