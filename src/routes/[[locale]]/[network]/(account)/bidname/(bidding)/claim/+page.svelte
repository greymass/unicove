<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { page } from '$app/state';

	import { Stack, Switcher } from 'unicove-components';
	import { Button } from 'unicove-components';
	import { Label } from 'unicove-components';
	import { PublicKeyInput } from 'unicove-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import AccountText from '$lib/components/elements/account.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { ClaimManager } from './manager.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let manager: ClaimManager = $state(new ClaimManager(data.network));

	let ownerKeyValid = $state(false);
	let activeKeyValid = $state(false);

	$effect(() => {
		if (context.account) {
			manager.sync(data.network, context.account, context.wharf);
		}
	});

	onMount(() => {
		const name = page.url.searchParams.get('name');
		if (name) {
			manager.bidName = name;
			manager.loadBid();
		}
	});

	$effect(() => {
		if (manager.bidName) {
			manager.loadBid();
		}
	});

	function resetState() {
		manager = new ClaimManager(data.network);
		const name = page.url.searchParams.get('name');
		if (name) {
			manager.bidName = name;
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
	{:else if !context.account}
		<p class="text-muted">Please log in to claim a name.</p>
	{:else if manager.loading}
		<p class="text-muted">Loading bid information...</p>
	{:else if !manager.currentBid}
		<p class="text-muted">No bid found for "{manager.bidName}".</p>
	{:else if !manager.isWon}
		<Stack class="gap-2">
			<h3 class="text-on-surface text-xl font-semibold">{manager.bidName}</h3>
			<p class="text-muted">This auction has not been won yet. The auction is still active.</p>
		</Stack>
	{:else if !manager.isHighBidder}
		<Stack class="gap-2">
			<h3 class="text-on-surface text-xl font-semibold">{manager.bidName}</h3>
			<p class="text-muted">
				This name was won by <AccountText name={manager.currentBid.high_bidder} />. Only the winning
				bidder can claim this name.
			</p>
		</Stack>
	{:else}
		<Switcher>
			<Stack class="gap-4">
				<Stack class="gap-2">
					<h3 class="text-muted leading-none">Claiming Name</h3>
					<p class="text-on-surface text-2xl font-bold">{manager.bidName}</p>
				</Stack>

				<fieldset class="grid gap-2">
					<Label for="owner-key-input">Owner Public Key</Label>
					<PublicKeyInput
						bind:value={manager.ownerKey}
						bind:valid={ownerKeyValid}
						id="owner-key-input"
						placeholder="Owner Public Key"
					/>
				</fieldset>

				<fieldset class="grid gap-2">
					<Label for="active-key-input">Active Public Key</Label>
					<PublicKeyInput
						bind:value={manager.activeKey}
						bind:valid={activeKeyValid}
						id="active-key-input"
						placeholder="Active Public Key"
					/>
				</fieldset>
			</Stack>

			<Button disabled={!manager.canClaim} onclick={() => manager.transact()} variant="primary">
				Claim Name
			</Button>
		</Switcher>
	{/if}
</Stack>
