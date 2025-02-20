<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { TokenBalance } from '@wharfkit/common';
	import { Checksum256 } from '@wharfkit/antelope';
	import { getContext, tick } from 'svelte';
	import { FiniteStateMachine } from 'runed';
	import * as m from '$lib/paraglide/messages.js';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import Progress from '$lib/components/progress.svelte';
	import SummarySend from '$lib/components/summary/eosio.token/transfer.svelte';
	import TextInput from '$lib/components/input/text.svelte';
	import TokenSelect from '$lib/components/select/token.svelte';

	import { defaultQuantity, SendState } from './state.svelte';

	import { formatCurrency } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { preventDefault } from '$lib/utils';
	import { NetworkState } from '$lib/state/network.svelte';
	import { page } from '$app/stores';
	import { SingleCard, Stack } from '$lib/components/layout';
	import TransactionSummary from '$lib/components/transactionSummary.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const sendState: SendState = $state(new SendState());

	let quantityInput: AssetInput | undefined = $state();
	let toInput: NameInput | undefined = $state();
	let tokenSelect: TokenSelect | undefined = $state();

	let quantityRef: HTMLInputElement | undefined = $state();
	let toRef: HTMLInputElement | undefined = $state();
	let memoRef: HTMLInputElement | undefined = $state();

	let id: Checksum256 | undefined = $state();

	function transact() {
		if (!context.wharf || !context.wharf.session) {
			return;
		}
		const balance = context.account?.balances.find((b) =>
			b.asset.symbol.equals(sendState.quantity.symbol)
		);
		if (balance) {
			let action = data.network.contracts.token.action('transfer', sendState.toJSON());
			if (!balance.contract.equals(data.network.contracts.token.account)) {
				action.account = balance.contract;
			}
			context.wharf
				.transact({ action })
				.then((result) => {
					id = result?.resolved?.transaction.id;
					f.send('success');
				})
				.catch((error) => {
					console.error('Transaction error', error);
					f.send('error');
				});
		} else {
			alert('Not logged in');
		}
	}

	function max() {
		if (sendState.balance) {
			quantityInput?.set(sendState.balance.asset);
		}
	}

	// Effect to handle token swapping
	$effect(() => {
		// Only trigger when the states quantity and balance do not match tokens
		if (!sendState.balance.asset.symbol.equals(sendState.quantity.symbol)) {
			// Reset the quantity to 0
			const quantity = Asset.fromUnits(0, sendState.balance.asset.symbol);
			// Reset the values
			quantityInput?.set(quantity);
			sendState.quantity = quantity;
			// Focus the quantity input
			quantityRef?.focus();
		}
	});

	// Effect to handle URL changes
	$effect(() => {
		const to = $page.url.searchParams.get('to');
		if (quantityRef && to && !String(sendState.to)) {
			toInput?.set(to);
			quantityRef?.focus();
			tick().then(() => f.send('next'));
		}

		const quantity = $page.url.searchParams.get('quantity');
		if (
			quantity &&
			quantityRef &&
			context.account &&
			context.account.balances &&
			context.account.balances.length &&
			sendState.quantity.equals(defaultQuantity)
		) {
			const asset = Asset.from(quantity);
			quantityInput?.set(asset);
			const balance = context.account.balances.find((b) => b.asset.symbol.equals(asset.symbol));
			if (balance) {
				tokenSelect?.set(balance);
			}
			memoRef?.focus();
			tick().then(() => f.send('next'));
		}
	});

	// Effect to handle needed state changes when setting the account
	$effect(() => {
		if (context.account) {
			const { name } = context.account;
			// Change the from field on the transfer
			if (name && sendState.from !== name) {
				f.send('reset');
			}

			// Set the balance to the default if it is not set
			if (
				sendState.quantity.equals(defaultQuantity) &&
				context.account.balances &&
				context.account.balances.length
			) {
				const balance = getDefaultBalance(data.network, context.account.balances);
				if (balance) {
					sendState.balance = balance;
					sendState.quantity = Asset.fromUnits(0, balance.asset.symbol);
					tokenSelect?.set(balance);
					quantityInput?.set(Asset.fromUnits(0, balance.asset.symbol));
				}
			}
		}
	});

	function getDefaultBalance(network: NetworkState, balances: TokenBalance[]) {
		const firstBalanceFound = balances[0];
		const systemTokenBalance = balances.find((b) =>
			b.metadata.id.equals(network.chain.systemToken)
		);

		const quantity = $page.url.searchParams.get('quantity');
		let selectedBalance: TokenBalance | undefined;
		if (quantity) {
			const asset = Asset.from(quantity);
			selectedBalance = balances.find((b) => b.asset.symbol.equals(asset.symbol));
		}
		const balance = selectedBalance || systemTokenBalance || firstBalanceFound;
		return balance;
	}

	// The state which the submit form can exist in
	type FormStates = 'to' | 'quantity' | 'memo' | 'complete' | 'error';

	// The events which can modify state
	type FormEvents = 'next' | 'previous' | 'reset' | 'success' | 'error';

	const f = new FiniteStateMachine<FormStates, FormEvents>('to', {
		to: {
			next: () => (toValid ? 'quantity' : 'to'),
			reset,
			_enter: () => tick().then(() => toRef?.focus())
		},
		quantity: {
			previous: 'to',
			next: () => (assetValid ? 'memo' : 'quantity'),
			reset,
			_enter: () => tick().then(() => quantityRef?.focus())
		},
		memo: {
			previous: 'quantity',
			reset,
			next: transact,
			success: 'complete',
			error: 'error',
			_enter: () => tick().then(() => memoRef?.focus())
		},
		complete: {
			reset
		},
		error: {
			previous: 'to',
			reset
		}
	});

	let assetValid = $state(false);
	let assetValidPrecision = $state(false);
	let assetValidMinimum = $state(false);
	let assetValidMaximum = $state(false);
	let memoValid = $state(true); // TODO: Implement validation
	let toValid = $state(false);

	const nextValid = $derived.by(() => {
		switch (f.current) {
			case 'to':
				return toValid;
			case 'quantity':
				return assetValid;
			case 'memo':
				return memoValid;
		}
	});

	const allValid = $derived(toValid && assetValid && memoValid);
	const ready = $derived(allValid && !context.wharf.transacting);

	const progress = $derived.by(() => {
		switch (f.current) {
			case 'to':
				return 1;
			case 'quantity':
				return 2;
			default:
			case 'memo':
				return 3;
		}
	});

	const next = () => f.send('next');
	const previous = () => f.send('previous');

	async function resetState() {
		// Reset the inputs
		if (toInput) {
			toInput.set('');
		}
		if (quantityInput) {
			quantityInput.set(null);
		}

		// Reset the form state itself
		sendState.reset();

		// Reset associated transaction ID
		id = undefined;

		// Default back to the account as the sender
		if (context.account && context.account.name) {
			sendState.from = context.account.name;
		}

		// Focus the "to" input field
		await tick();
		toRef?.focus();
	}

	async function resetURL() {
		$page.url.searchParams.delete('to');
		$page.url.searchParams.delete('quantity');
		await goto(`?${$page.url.searchParams.toString()}`);
		f.send('reset');
	}

	function reset(): FormStates {
		// Call reset
		resetState();

		// Return the state it should reset to
		return 'to';
	}

	const subtitle = {
		to: m.common_recipient(),
		quantity: m.common_asset(),
		memo: m.common_confirm(),
		complete: m.common_complete(),
		error: m.common_error()
	};

	const tokenOptions: TokenBalance[] = $derived.by(() => {
		if (context.account && context.account.balances && context.account.balances.length) {
			return context.account.balances.filter((b) => b.asset.value > 0);
		}
		return [];
	});

	function onkeydown(event: Event) {
		const { key } = event as KeyboardEvent;
		if (key === 'Enter') {
			if (f.current === 'memo') {
				transact();
			} else {
				next();
			}
		}
		if (key === 'Escape') {
			if (f.current === 'to') {
				resetURL();
			} else {
				previous();
			}
		}
	}
</script>

{#snippet Recipient()}
	<fieldset class="grid gap-2" class:hidden={f.current !== 'to'}>
		<Label for="to-input">{m.send_receiving_account()}</Label>
		<NameInput
			bind:this={toInput}
			bind:ref={toRef}
			bind:value={sendState.to}
			bind:valid={toValid}
			id="to-input"
			{onkeydown}
			placeholder={m.send_receiving_placeholder()}
		/>
	</fieldset>
{/snippet}

{#snippet Quantity()}
	<section class="grid gap-6" class:hidden={f.current !== 'quantity'}>
		<fieldset class="grid gap-2">
			<Label for="token-select">{m.send_tokens_to_send()}</Label>
			{#if tokenOptions.length && sendState.balance}
				<TokenSelect
					id="token-select"
					options={tokenOptions}
					bind:this={tokenSelect}
					bind:selected={sendState.balance}
					debug={context.settings.data.debugMode as boolean}
				/>
			{:else}
				<p>{m.common_no_balances()}</p>
			{/if}
		</fieldset>

		<fieldset class="grid gap-2">
			<Label for="quantity-input">{m.send_amount_to_send()}</Label>
			{#if sendState.balance}
				<AssetInput
					id="quantity-input"
					bind:this={quantityInput}
					bind:ref={quantityRef}
					bind:value={sendState.quantity}
					bind:valid={assetValid}
					bind:validPrecision={assetValidPrecision}
					bind:validMinimum={assetValidMinimum}
					bind:validMaximum={assetValidMaximum}
					min={sendState.min || 0}
					max={sendState.max || 0}
					{onkeydown}
					placeholder={m.send_enter_amount({
						token: sendState.balance?.asset.symbol.code
					})}
					debug={context.settings.data.debugMode as boolean}
				/>
			{/if}

			{#if context.account}
				<button
					class="text-skyBlue-500 hover:text-skyBlue-400"
					disabled={!context.account}
					onclick={max}
				>
					{m.common_fill_max()}
				</button>
			{/if}

			{#if assetValid && sendState.value}
				<Label for="quantity-input"
					>{m.common_value_with_amount({
						amount: formatCurrency(sendState.value)
					})}</Label
				>
			{/if}

			{#if !assetValidPrecision}
				<p class="text-red-500">{m.common_invalid_number_decimals()}</p>
			{/if}

			{#if !assetValidMaximum}
				<p class="text-red-500">{m.common_amount_exceeds_balance()}</p>
			{/if}
		</fieldset>
	</section>
{/snippet}

{#snippet Memo()}
	<SummarySend data={sendState.toJSON()} class={f.current !== 'memo' ? 'hidden' : undefined} />

	<fieldset class="grid gap-2" class:hidden={f.current !== 'memo'}>
		<Label for="memo-input">{m.common_memo()} ({m.common_optional()})</Label>
		<TextInput
			id="memo-input"
			bind:ref={memoRef}
			bind:value={sendState.memo}
			{onkeydown}
			placeholder={m.send_memo_placeholder()}
		/>
	</fieldset>
{/snippet}

{#snippet Complete()}
	<TransactionSummary hidden={f.current !== 'complete'} transactionId={id} />
{/snippet}

{#snippet Error()}
	<div class:hidden={f.current !== 'error'}>
		<h2 class="h2">{m.common_transaction_error()}</h2>
		<p>{m.common_transaction_error_subtitle()}</p>
	</div>
{/snippet}

{#snippet ButtonGroup()}
	<fieldset class="flex gap-2 *:flex-1">
		{#if f.current === 'to'}
			<Button variant="secondary" onclick={() => resetURL()}>{m.common_restart()}</Button>
		{:else if f.current === 'complete'}
			<Button onclick={() => resetURL()}>{m.send_start_new()}</Button>
		{:else}
			<Button variant="secondary" onclick={previous}>{m.common_back()}</Button>
		{/if}

		{#if f.current === 'memo'}
			<Button class="col-end-3" onclick={transact} disabled={!ready}>{m.common_submit()}</Button>
		{:else if f.current !== 'complete'}
			<Button class="col-end-3" type="submit" onclick={preventDefault(next)} disabled={!nextValid}>
				{m.common_next()}
			</Button>
		{/if}
	</fieldset>
{/snippet}

<SingleCard>
	<Stack>
		<div class="hidden">
			<h3>{subtitle[f.current]}</h3>
			<Progress currentStep={progress} maxStep={3} />
		</div>

		{@render Complete()}

		{@render Error()}

		{@render Recipient()}

		{@render Quantity()}

		{@render Memo()}

		{@render ButtonGroup()}
	</Stack>
</SingleCard>

{#if context.settings.data.debugMode}
	<h3 class="h3">{m.common_debugging()}</h3>
	<Code
		>{JSON.stringify(
			{
				state: sendState,
				price: sendState.price,
				value: sendState.value,
				current: f.current,
				balance: sendState.balance,
				max: sendState.max,
				valid: {
					toValid,
					assetValid,
					memoValid,
					assetValidPrecision,
					assetValidMinimum,
					assetValidMaximum
				},
				balances: context.account?.balances
			},
			undefined,
			2
		)}</Code
	>
{/if}
