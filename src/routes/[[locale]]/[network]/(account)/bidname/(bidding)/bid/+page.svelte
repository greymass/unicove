<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { page } from '$app/state';
	import { getContext, untrack } from 'svelte';

	import { Stack } from 'unicove-components';
	import { AssetInput } from 'unicove-components';
	import { Button } from 'unicove-components';
	import { Label } from 'unicove-components';
	import { DD, DL, DLRow } from 'unicove-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import AccountLink from '$lib/components/elements/account.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	import { BidManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: BidManager = $state(new BidManager(data.network));
	let input: AssetInput | undefined = $state();
	let ready = $derived(manager.canBid && !context.wharf.transacting);

	const nameParam = $derived(page.url.searchParams.get('name') || '');

	let now = $state(Date.now());

	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		if (nameParam && manager.bidName !== nameParam) {
			manager.bidName = nameParam;
		}
	});

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	$effect(() => {
		const name = manager.bidName;
		if (name) {
			untrack(() => {
				manager.loadCurrentBid();
				manager.loadAuctionState();
			});
		}
	});

	const currentBidAsset = $derived(
		manager.currentBid && manager.network
			? Asset.fromUnits(manager.currentBid.high_bid, manager.network.config.systemtoken.symbol)
			: undefined
	);

	const maxValue = $derived(
		context.account?.balance?.balance ? context.account.balance.balance.value : 0
	);

	const minValue = $derived(manager.minimumBid.value);

	const timeRemaining = $derived(Math.max(0, manager.auctionCloseTime - now));
	const auctionEligible = $derived(timeRemaining === 0 && !!manager.leadingBid);

	function formatCountdown(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	function resetState() {
		manager = new BidManager(data.network);
		if (nameParam) {
			manager.bidName = nameParam;
		}
	}
</script>

<Stack>
	{#if manager.txid}
		<TransactSummary transactionId={manager.txid} />
		<Button href={context.urlPath(`/bidname`)} variant="secondary">Back to Premium Names</Button>
	{:else if manager.error}
		<TransactError error={manager.error} />
		<Button onclick={resetState}>Try Again</Button>
	{:else if !manager.bidName}
		<p class="text-muted">No name specified. Go back to browse available names.</p>
		<Button href={context.urlPath(`/bidname`)} variant="secondary">Browse Names</Button>
	{:else}
		<Stack class="gap-4">
			{#if manager.leadingBid && manager.leadingBidAsset}
				<div class="bg-primary/5 border-primary/20 rounded-xl border p-4">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p class="text-muted text-xs font-medium uppercase tracking-wider">
								Current Top Bid (all names)
							</p>
							<p class="text-on-surface text-lg font-bold">
								{String(manager.leadingBidAsset)} on {String(manager.leadingBid.newname)}
							</p>
						</div>
						<div class="text-right">
							{#if auctionEligible}
								<span class="text-success text-sm font-medium">Eligible to close</span>
							{:else}
								<p class="text-muted text-xs font-medium uppercase tracking-wider">Closes in</p>
								<p class="text-on-surface font-mono text-lg font-bold">
									{formatCountdown(timeRemaining)}
								</p>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<div class="bg-surface-container rounded-xl p-4">
				<DL>
					<DLRow title="Bidding on">
						<DD>
							<span class="text-on-surface text-lg font-bold">{manager.bidName}</span>
						</DD>
					</DLRow>
					{#if manager.loading}
						<DLRow title="Status">
							<DD>Loading current bid...</DD>
						</DLRow>
					{:else if currentBidAsset}
						<DLRow title="Current High Bid">
							<DD>{String(currentBidAsset)}</DD>
						</DLRow>
						<DLRow title="High Bidder">
							<DD>
								{#if manager.currentBid?.high_bidder}
									<AccountLink name={manager.currentBid.high_bidder} />
								{/if}
							</DD>
						</DLRow>
						<DLRow title="Minimum Bid (10% higher)">
							<DD>{String(manager.minimumBid)}</DD>
						</DLRow>
					{:else}
						<DLRow title="Status">
							<DD>No bids yet - be the first!</DD>
						</DLRow>
						<DLRow title="Minimum Bid">
							<DD>{String(manager.minimumBid)}</DD>
						</DLRow>
					{/if}
				</DL>
			</div>

			<Stack class="gap-3">
				<Label for="assetInput">Bid Amount</Label>
				<AssetInput
					autofocus
					bind:this={input}
					bind:value={manager.bidAmount}
					bind:valid={manager.bidValid}
					min={minValue}
					max={maxValue}
				/>
				{#if !manager.bidValid && manager.bidAmount.value > 0}
					{#if manager.bidAmount.value > maxValue && maxValue > 0}
						<p class="text-error text-sm">Amount exceeds available balance.</p>
					{:else if manager.bidAmount.units.toNumber() < manager.minimumBid.units.toNumber()}
						<p class="text-error text-sm">
							Bid must be at least {String(manager.minimumBid)}.
						</p>
					{/if}
				{/if}

				{#if manager.canBid && manager.wouldBecomeTopBid}
					<p class="text-success text-sm font-medium">
						This bid will become the highest across all names and start a new 24-hour countdown.
					</p>
				{:else if manager.canBid && manager.leadingBid && !manager.wouldBecomeTopBid}
					<p class="text-muted text-sm">
						This bid will make you the highest bidder on <strong>{manager.bidName}</strong>, but the
						auction countdown is currently led by <strong
							>{String(manager.leadingBid.newname)}</strong
						>
						at {String(manager.leadingBidAsset)}. Your name will only close after that auction ends.
					</p>
				{/if}

				<Button disabled={!ready} onclick={() => manager.transact()} variant="primary">
					Place Bid
				</Button>
			</Stack>

			<div class="text-muted mt-2 space-y-2 text-xs leading-relaxed">
				<p>
					<strong class="text-on-surface-variant">How premium name auctions work:</strong> Only one name
					can be claimed at a time. The name with the highest bid across all auctions is next to close.
					Once 24 hours pass without a higher bid on any name, that auction ends and the winner can
					claim their name.
				</p>
				<p>
					Each new bid on a name must be at least 10% higher than the current bid. If your bid becomes
					the highest across all names, the 24-hour countdown resets. If you are outbid, your tokens
					become available to refund.
				</p>
			</div>
		</Stack>
	{/if}
</Stack>
