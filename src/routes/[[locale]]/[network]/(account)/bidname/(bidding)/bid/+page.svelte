<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { page } from '$app/state';
	import { getContext } from 'svelte';

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
		if (manager.bidName) {
			manager.loadCurrentBid();
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

				<Button disabled={!ready} onclick={() => manager.transact()} variant="primary">
					Place Bid
				</Button>
			</Stack>
		</Stack>
	{/if}
</Stack>
