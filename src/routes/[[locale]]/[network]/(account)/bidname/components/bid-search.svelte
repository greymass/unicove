<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import { Button, Stack } from 'unicove-components';
	import AccountLink from '$lib/components/elements/account.svelte';
	import { BidnameState } from '$lib/state/bidname.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { addTrackedName, getTrackedNames, removeTrackedName } from '../tracked';

	interface Props {
		network: NetworkState;
		urlPath: (path: string) => string;
		accountName?: string;
		ontrackchange?: () => void;
	}

	const { network, urlPath, accountName, ontrackchange }: Props = $props();

	const bidnameState = new BidnameState(network);

	let query = $state('');
	let result: import('$lib/wharf/contracts/system').Types.name_bid | undefined | null =
		$state(null);
	let searching = $state(false);
	let accountExists = $state(false);
	let validationError = $state('');

	let tracked = $state(false);

	const searchedName = $derived(query.trim().toLowerCase());

	function isTracked(name: string): boolean {
		if (!accountName) return false;
		return getTrackedNames(accountName).includes(name);
	}

	function toggleTrack(name: string) {
		if (!accountName) return;
		if (isTracked(name)) {
			removeTrackedName(accountName, name);
			tracked = false;
		} else {
			addTrackedName(accountName, name);
			tracked = true;
		}
		ontrackchange?.();
	}

	const namePattern = /^[a-z1-5]{1,11}$/;

	function validate(value: string): boolean {
		if (!value) {
			validationError = '';
			return false;
		}
		if (value.includes('.')) {
			validationError = 'Premium names cannot contain dots';
			return false;
		}
		if (value.length > 11) {
			validationError = 'Premium names must be 11 characters or fewer';
			return false;
		}
		if (!namePattern.test(value)) {
			validationError = 'Only lowercase a-z and digits 1-5 are allowed';
			return false;
		}
		validationError = '';
		return true;
	}

	function formatBidAmount(highBid: import('@wharfkit/antelope').Int64): string {
		const symbol = network.config.systemtoken.id.symbol;
		return String(Asset.fromUnits(highBid, symbol));
	}

	function formatRelativeTime(timestamp: number): string {
		const diff = Date.now() - timestamp;
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);
		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		const minutes = Math.floor(diff / (1000 * 60));
		return `${minutes}m ago`;
	}

	async function search() {
		const name = query.trim().toLowerCase();
		if (!validate(name)) return;

		searching = true;
		result = null;
		accountExists = false;

		try {
			const [bid] = await Promise.all([
				bidnameState.lookupBid(name),
				network.client.v1.chain
					.get_account(name)
					.then(() => {
						accountExists = true;
					})
					.catch(() => {
						accountExists = false;
					})
			]);
			result = bid ?? undefined;
			tracked = isTracked(name);
		} catch {
			result = undefined;
		} finally {
			searching = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			search();
		}
	}
</script>

<Stack>
	<div class="flex gap-2">
		<input
			type="text"
			bind:value={query}
			onkeydown={handleKeydown}
			placeholder="Search premium names..."
			class="bg-surface-container border-outline-variant text-on-surface placeholder:text-muted flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
		/>
		<Button variant="primary" onclick={search} disabled={searching || !query.trim()}>
			Search
		</Button>
	</div>

	{#if validationError}
		<p class="text-error text-sm">{validationError}</p>
	{/if}

	{#if searching}
		<p class="text-muted text-sm">Searching...</p>
	{:else if result !== null}
		{#if accountExists && !result}
			<div class="bg-surface-container-high rounded-lg p-4">
				<p class="text-on-surface font-medium">This name is already taken</p>
				<p class="text-muted text-sm">
					The account "{query.trim().toLowerCase()}" already exists on the network.
				</p>
			</div>
		{:else if result}
			{@const bid = result}
			<div class="bg-surface-container-high rounded-lg p-4">
				<Stack class="gap-2">
					<div class="flex items-center justify-between">
						<h4 class="text-on-surface text-lg font-bold">{String(bid.newname)}</h4>
						<span class="text-muted text-xs">
							{formatRelativeTime(bid.last_bid_time.toMilliseconds())}
						</span>
					</div>
					<div class="flex flex-col gap-1">
						<p class="text-on-surface text-sm">
							<span class="text-muted">Current bid:</span>
							{formatBidAmount(bid.high_bid)}
						</p>
						<p class="text-sm">
							<span class="text-muted">High bidder:</span>
							<AccountLink name={bid.high_bidder} />
						</p>
					</div>
					<div class="flex flex-wrap gap-2">
						<Button
							href={urlPath(`/bidname/bid?name=${String(bid.newname)}`)}
							variant="primary"
						>
							Place Bid
						</Button>
						{#if accountName}
							<Button
								variant="secondary"
								onclick={() => toggleTrack(String(bid.newname))}
							>
								{tracked ? 'Untrack' : 'Track'}
							</Button>
						{/if}
					</div>
				</Stack>
			</div>
		{:else if !accountExists}
			<div class="bg-surface-container-high rounded-lg p-4">
				<Stack class="gap-2">
					<p class="text-on-surface font-medium">No bids yet - be the first!</p>
					<p class="text-muted text-sm">
						No one has placed a bid on "{searchedName}" yet.
					</p>
					<div class="flex flex-wrap gap-2">
						<Button
							href={urlPath(`/bidname/bid?name=${searchedName}`)}
							variant="primary"
						>
							Start Bidding
						</Button>
						{#if accountName}
							<Button
								variant="secondary"
								onclick={() => toggleTrack(searchedName)}
							>
								{tracked ? 'Untrack' : 'Track'}
							</Button>
						{/if}
					</div>
				</Stack>
			</div>
		{/if}
	{/if}
</Stack>
