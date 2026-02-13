<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import { Button, Stack } from 'unicove-components';
	import AccountLink from '$lib/components/elements/account.svelte';
	import type { Types } from '$lib/wharf/contracts/system';
	import type { NetworkState } from '$lib/state/network.svelte';

	interface Props {
		bids: Types.name_bid[];
		loading: boolean;
		network: NetworkState;
		urlPath: (path: string) => string;
	}

	const { bids, loading, network, urlPath }: Props = $props();

	function formatRelativeTime(timestamp: number): string {
		const diff = Date.now() - timestamp;
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);
		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		const minutes = Math.floor(diff / (1000 * 60));
		return `${minutes}m ago`;
	}

	function formatBidAmount(bid: Types.name_bid): string {
		const symbol = network.config.systemtoken.id.symbol;
		return String(Asset.fromUnits(bid.high_bid, symbol));
	}
</script>

{#if loading}
	<Stack>
		<p class="text-muted">Loading bids...</p>
	</Stack>
{:else if bids.length === 0}
	<Stack>
		<p class="text-muted">No active bids found.</p>
	</Stack>
{:else}
	<div class="flex flex-col">
		{#each bids as bid, i}
			<div
				class="border-outline-variant hover:bg-surface-container-high flex flex-col gap-2 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
			>
				<div class="flex items-center gap-3 sm:flex-1">
					<span class="text-muted w-6 text-right text-sm font-medium">{i + 1}</span>
					<div class="min-w-0 flex-1">
						<p class="text-on-surface truncate font-bold">{String(bid.newname)}</p>
						<p class="text-muted text-sm">
							<AccountLink name={bid.high_bidder} />
						</p>
					</div>
				</div>
				<div class="flex items-center justify-between gap-4 pl-9 sm:justify-end sm:pl-0">
					<div class="text-right">
						<p class="text-on-surface text-sm font-medium">{formatBidAmount(bid)}</p>
						<p class="text-muted text-xs">
							{formatRelativeTime(bid.last_bid_time.toMilliseconds())}
						</p>
					</div>
					<Button href={urlPath(`/bidname/bid?name=${String(bid.newname)}`)} variant="text">
						Bid
					</Button>
				</div>
			</div>
		{/each}
	</div>
{/if}
