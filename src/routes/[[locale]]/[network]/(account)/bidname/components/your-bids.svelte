<script lang="ts">
	import { Asset, type NameType } from '@wharfkit/antelope';

	import { Button, Card, Stack } from 'unicove-components';
	import AccountLink from '$lib/components/elements/account.svelte';
	import { BidnameState } from '$lib/state/bidname.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { Types } from '$lib/wharf/contracts/system';
	import { getTrackedNames, removeTrackedName } from '../tracked';

	interface Props {
		accountName: string;
		network: NetworkState;
		urlPath: (path: string) => string;
		onrefresh?: (refresh: () => void) => void;
		ontrackchange?: (sync: () => void) => void;
	}

	const { accountName, network, urlPath, onrefresh, ontrackchange }: Props = $props();

	interface TrackedBid {
		name: string;
		bid: Types.name_bid | undefined;
		refund: Types.bid_refund | undefined;
		status: 'leading' | 'outbid' | 'watching' | 'won' | 'claimed' | 'no_bids' | 'unknown';
	}

	let trackedBids: TrackedBid[] = $state([]);
	let loading = $state(false);

	const bidnameState = new BidnameState(network);

	function determineStatus(
		bid: Types.name_bid | undefined,
		refund: Types.bid_refund | undefined,
		account: string
	): 'leading' | 'outbid' | 'watching' | 'won' | 'claimed' | 'no_bids' | 'unknown' {
		if (!bid) {
			if (refund) return 'claimed';
			return 'no_bids';
		}
		const highBid = bid.high_bid.toNumber();
		if (highBid < 0) return 'won';
		if (highBid > 0 && String(bid.high_bidder) === account) return 'leading';
		if (highBid > 0 && String(bid.high_bidder) !== account) {
			if (refund) return 'outbid';
			return 'watching';
		}
		return 'unknown';
	}

	async function loadTrackedBids() {
		const names = getTrackedNames(accountName);
		if (names.length === 0) {
			trackedBids = [];
			return;
		}

		if (trackedBids.length === 0) {
			loading = true;
		}
		try {
			const results = await Promise.all(
				names.map(async (name) => {
					const [bid, refund] = await Promise.all([
						bidnameState.lookupBid(name).catch(() => undefined),
						fetchRefundForUser(name, accountName).catch(() => undefined)
					]);
					const status = determineStatus(bid, refund, accountName);
					return { name, bid, refund, status } as TrackedBid;
				})
			);
			trackedBids = results;
		} catch {
			trackedBids = [];
		} finally {
			loading = false;
		}
	}

	async function fetchRefundForUser(
		bidName: NameType,
		account: NameType
	): Promise<Types.bid_refund | undefined> {
		return network.contracts.eosio.table('bidrefunds', bidName).get(account);
	}

	function formatBidAmount(bid: Types.name_bid): string {
		const symbol = network.config.systemtoken.id.symbol;
		const units = bid.high_bid.toNumber();
		return String(Asset.fromUnits(Math.abs(units), symbol));
	}

	function handleRemove(name: string) {
		removeTrackedName(accountName, name);
		trackedBids = trackedBids.filter((b) => b.name !== name);
	}

	function statusLabel(status: string): { text: string; classes: string } {
		switch (status) {
			case 'leading':
				return { text: 'Highest Bidder', classes: 'bg-success/15 text-success' };
			case 'outbid':
				return { text: 'Outbid', classes: 'bg-error/15 text-error' };
			case 'watching':
				return { text: 'Watching', classes: 'bg-primary/15 text-primary' };
			case 'won':
				return { text: 'Won', classes: 'bg-success/15 text-success' };
			case 'claimed':
				return { text: 'Claimed', classes: 'bg-surface-container-high text-muted' };
			case 'no_bids':
				return { text: 'No Bids', classes: 'bg-surface-container-high text-muted' };
			default:
				return { text: 'Unknown', classes: 'bg-surface-container-high text-muted' };
		}
	}

	async function fetchSingleBid(name: string): Promise<TrackedBid> {
		const [bid, refund] = await Promise.all([
			bidnameState.lookupBid(name).catch(() => undefined),
			fetchRefundForUser(name, accountName).catch(() => undefined)
		]);
		const status = determineStatus(bid, refund, accountName);
		return { name, bid, refund, status };
	}

	async function syncTrackedBids() {
		const names = getTrackedNames(accountName);
		const currentNames = trackedBids.map((b) => b.name);

		const added = names.filter((n) => !currentNames.includes(n));
		const removed = currentNames.filter((n) => !names.includes(n));

		if (removed.length > 0) {
			trackedBids = trackedBids.filter((b) => !removed.includes(b.name));
		}

		if (added.length > 0) {
			const newBids = await Promise.all(added.map(fetchSingleBid));
			trackedBids = [...trackedBids, ...newBids];
		}
	}

	loadTrackedBids();
	onrefresh?.(() => loadTrackedBids());
	ontrackchange?.(() => syncTrackedBids());
</script>

<Card id="monitored-names" title="Monitored Names">
	<Stack>
		{#if loading}
			<p class="text-muted text-sm">Loading tracked names...</p>
		{:else if trackedBids.length === 0}
			<p class="text-muted text-sm">
				Search for a name above and click Track to monitor its bid status.
			</p>
		{:else}
			<div class="flex flex-col gap-2">
				{#each trackedBids as tracked}
					{@const badge = statusLabel(tracked.status)}
					<div class="bg-surface-container-high rounded-lg p-4">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span class="text-on-surface truncate font-bold">{tracked.name}</span>
									<span
										class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium {badge.classes}"
									>
										{badge.text}
									</span>
								</div>
								{#if tracked.bid}
									<div class="mt-1 flex flex-col gap-0.5">
										<p class="text-on-surface text-sm">
											<span class="text-muted">High bid:</span>
											{formatBidAmount(tracked.bid)}
										</p>
										<p class="text-sm">
											<span class="text-muted">Bidder:</span>
											<AccountLink name={tracked.bid.high_bidder} />
										</p>
									</div>
								{:else if tracked.status === 'no_bids'}
									<p class="text-muted mt-1 text-sm">No one has bid on this name yet.</p>
								{/if}
							</div>
							<button
								class="text-muted hover:text-on-surface shrink-0 p-1 text-sm"
								onclick={() => handleRemove(tracked.name)}
								title="Stop tracking"
							>
								✕
							</button>
						</div>
						{#if tracked.status === 'outbid'}
							<p class="text-error mt-2 text-sm font-medium">
								You have been outbid on this name.{#if tracked.refund}{' '}You have {String(tracked.refund.amount)} available to reclaim.{/if}
							</p>
							<div class="mt-3 inline-flex flex-wrap gap-2">
								<Button href={urlPath(`/bidname/bid?name=${tracked.name}`)} variant="secondary">
									Place Bid
								</Button>
								{#if tracked.refund}
									<Button
										href={urlPath(`/bidname/refund?name=${tracked.name}`)}
										variant="secondary"
									>
										Claim Refund ({String(tracked.refund.amount)})
									</Button>
								{/if}
							</div>
						{:else if tracked.status === 'won'}
							<div class="mt-3 inline-flex">
								<Button href={urlPath(`/bidname/claim?name=${tracked.name}`)} variant="primary">
									Claim Name
								</Button>
							</div>
						{:else if tracked.status === 'watching'}
							<div class="mt-3 inline-flex">
								<Button href={urlPath(`/bidname/bid?name=${tracked.name}`)} variant="secondary">
									Place Bid
								</Button>
							</div>
						{:else if tracked.status === 'no_bids'}
							<div class="mt-3 inline-flex">
								<Button href={urlPath(`/bidname/bid?name=${tracked.name}`)} variant="secondary">
									Place Bid
								</Button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</Stack>
</Card>
