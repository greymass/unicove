<script lang="ts">
	import { Asset, Checksum256 } from '@wharfkit/antelope';
	import { getContext } from 'svelte';

	import Code from '$lib/components/code.svelte';
	import AssetInput from '$lib/components/input/asset.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';

	import * as m from '$lib/paraglide/messages';
	import { PlaceholderAuth } from '@wharfkit/signing-request';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte.js';
	import { TokenBalance } from '$lib/types/token.js';
	import { ArrowRightLeft } from 'lucide-svelte';
	import Label from '$lib/components/input/label.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	let id: Checksum256 | undefined = $state();
	let error: string | undefined = $state();

	const baseDefaultAsset = Asset.fromUnits(0, data.base.symbol);
	const baseDefault = TokenBalance.from({ id: data.base, balance: baseDefaultAsset });
	const quoteDefaultAsset = Asset.fromUnits(0, data.quote.symbol);
	const quoteDefault = TokenBalance.from({ id: data.quote, balance: quoteDefaultAsset });

	let baseInput: AssetInput | undefined = $state();
	let baseQuantity = $state(Asset.from(baseDefaultAsset));
	let baseBalance: TokenBalance = $derived(
		context.account ? context.account.getBalance(data.base) : baseDefault
	);

	let quoteInput: AssetInput | undefined = $state();
	let quoteQuantity = $state(Asset.from(quoteDefaultAsset));
	let quoteBalance: TokenBalance = $derived(
		context.account ? context.account.getBalance(data.quote) : quoteDefault
	);

	const swap = $derived.by(() => market.market.getSwap(data.base, data.quote));

	async function transact() {
		if (!swap || !swap.pair.base.contract) {
			throw new Error('No swap available for this pair');
		}
		if (!context.account) {
			throw new Error('No account');
		}
		if (!data.base.contract) {
			throw new Error('Base contract is not defined');
		}
		if (!baseBalance) {
			throw new Error('Base balance does not exist');
		}
		const action = {
			account: swap.pair.base.contract,
			name: swap.action,
			authorization: [PlaceholderAuth],
			data: {
				from: context.account.name,
				to: swap.contract,
				quantity: baseQuantity,
				memo: ''
			}
		};
		if (context.wharf) {
			context.wharf
				.transact({
					action
				})
				.then((result) => {
					id = result?.resolved?.transaction.id;
					baseBalance = TokenBalance.from({
						...baseBalance,
						balance: Asset.fromUnits(
							baseBalance.balance.units.subtracting(baseQuantity.units),
							baseBalance.balance.symbol
						)
					});

					quoteBalance = TokenBalance.from({
						...quoteBalance,
						balance: Asset.fromUnits(
							quoteBalance.balance.units.adding(quoteQuantity.units),
							quoteBalance.balance.symbol
						)
					});
				})
				.catch((e) => {
					console.error('Transaction error', e);
					error = e;
				});
		}
	}

	function flip() {
		const base = Asset.from(quoteQuantity);
		const quote = Asset.from(baseQuantity);
		baseInput?.set(base);
		baseQuantity = base;
		quoteInput?.set(quote);
		quoteQuantity = quote;
	}

	function baseChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (swap) {
			const quote = Asset.fromFloat(
				Number(e.currentTarget.value) * swap.pair.price.value,
				quoteQuantity.symbol
			);
			quoteQuantity = quote;
			quoteInput?.set(quote);
		}
	}

	function quoteChange(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (swap) {
			const base = Asset.fromFloat(
				Number(e.currentTarget.value) / swap.pair.price.value,
				baseQuantity.symbol
			);
			baseQuantity = base;
			baseInput?.set(base);
		}
	}
</script>

{#snippet Success()}
	<div class="flex gap-4">
		<Button variant="secondary" onclick={() => (id = undefined)}>Back to Swap</Button>
		<Button href={`/${data.network}/account/${context.account?.name}`}>
			{m.common_view_my_account()}
		</Button>
	</div>
{/snippet}

{#snippet Failure()}
	<div class="flex gap-4">
		<Button onclick={() => (error = undefined)}>{m.common_back()}</Button>
	</div>
{/snippet}

{#snippet Balances()}
	<div class="flex gap-4">
		<div class="bg-shark-900/40 flex-1 rounded-md">
			{baseBalance.balance.symbol.name}
			<p><AssetText value={baseBalance.balance} /></p>
			<p>Available</p>
		</div>
		<div class="flex-1">
			<Button
				href="/{data.network}/swap/{data.quote.url}/{data.base.url}"
				onclick={flip}
				disabled={context.wharf.transacting}
				variant="secondary"
			>
				<ArrowRightLeft />
			</Button>
		</div>
		<div class="bg-shark-900/40 flex-1 rounded-md">
			{quoteBalance.balance.symbol.name}
			<p><AssetText value={quoteBalance.balance} variant="full" /></p>
			<p>Available</p>
		</div>
	</div>
{/snippet}

{#snippet BaseField()}
	<Label for="base-quantity">Swap {baseQuantity.symbol.name}</Label>
	<AssetInput
		id="base-quantity"
		bind:value={baseQuantity}
		bind:this={baseInput}
		oninput={baseChange}
		disabled={context.wharf.transacting}
	/>
{/snippet}

{#snippet QuoteField()}
	<Label for="base-quantity">For {quoteQuantity.symbol.name}</Label>
	<AssetInput
		bind:value={quoteQuantity}
		bind:this={quoteInput}
		oninput={quoteChange}
		disabled={context.wharf.transacting}
	/>
{/snippet}

<TransactForm {id} {error} onsuccess={Success} onfailure={Failure}>
	{@render Balances()}

	{#if swap}
		<div class="flex gap-4">
			<div class="flex-1 space-y-2">{@render BaseField()}</div>
			<div class="flex-1 space-y-2">{@render QuoteField()}</div>
		</div>

		<p class="text-center">
			This swap will exchange
			<AssetText class="font-bold text-white" value={baseQuantity} variant="full" />
			for
			<AssetText class="font-bold text-white" value={quoteQuantity} variant="full" />.
		</p>

		<Button onclick={transact} disabled={context.wharf.transacting}>
			{m.common_swap_to_token({
				token: String(data.quote.symbol.name)
			})}
		</Button>
	{:else if !market.market.loaded}
		<p>Loading</p>
	{:else}
		<p class="text-center">No swaps available for this pair.</p>
	{/if}
</TransactForm>

{#if context.settings.data.debugMode}
	<Code
		json={{
			loaded: market.market.loaded,
			refreshed: market.market.refreshed,
			baseQuantity,
			quoteQuantity,
			base: data.base,
			quote: data.quote,
			swap
		}}
	/>
{/if}
