<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { TokenBalance } from '@wharfkit/common';
	import { Checksum256 } from '@wharfkit/session';
	import { getContext, onMount, tick } from 'svelte';
	import { FiniteStateMachine } from 'runed';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import Progress from '$lib/components/progress.svelte';
	import TextInput from '$lib/components/input/textinput.svelte';
	import TokenSelect from '$lib/components/select/token.svelte';
	import PageHeader from '$lib/components/pageheader.svelte';

	import { defaultQuantity, SendState } from './state.svelte';

	import { getSetting } from '$lib/state/settings.svelte';
	import { formatCurrency } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { languageTag } from '$lib/paraglide/runtime';
	import { preventDefault } from '$lib/utils';
	import { NetworkState } from '$lib/state/network.svelte';
	import { page } from '$app/stores';
	import { error } from '@sveltejs/kit';
	import { transactions } from '$lib/wharf/transact.svelte';

	const debugMode = getSetting('debug-mode', false);

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const state: SendState = $state(new SendState());
	let chain: Checksum256 | undefined = $state(data.network.chain.id);

	let quantityInput: AssetInput = $state();
	let toInput: NameInput = $state();
	let tokenSelect: TokenSelect = $state();

	let quantityRef = $state();
	let toRef = $state();
	let memoRef = $state();

	let id: Checksum256 | undefined = $state();
	const transaction = $derived(
		id ? transactions.find((t) => t.transaction?.id.equals(id)) : undefined
	);

	function transact() {
		if (!context.wharf || !context.wharf.session) {
			return;
		}
		if (data.network.contracts.token) {
			const action = data.network.contracts.token.action('transfer', state.toJSON());
			context.wharf
				.transact({ action })
				.then((result) => {
					console.log('Transaction result', result);
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
		if (state.balance) {
			quantityInput.set(state.balance.asset);
		}
	}

	// Effect to handle network changes
	$effect(() => {
		if (
			data.network.chain.id &&
			context.account &&
			!context.account.network.chain.equals(data.network.chain)
		) {
			goto(`/${languageTag()}/${context.account.network}/send`);
		}
	});

	// Effect to handle token swapping
	$effect(() => {
		// Only trigger when the states quantity and balance do not match tokens
		if (!state.balance.asset.symbol.equals(state.quantity.symbol)) {
			// Reset the quantity to 0
			const quantity = Asset.fromUnits(0, state.balance.asset.symbol);
			// Reset the values
			quantityInput.set(quantity);
			state.quantity = quantity;
			// Focus the quantity input
			quantityRef.focus();
		}
	});

	// Effect to handle URL changes
	$effect(() => {
		const to = $page.url.searchParams.get('to');
		if (quantityRef && to && !String(state.to)) {
			toInput.set(to);
			quantityRef.focus();
			tick().then(() => f.send('next'));
		}

		const quantity = $page.url.searchParams.get('quantity');
		if (
			quantity &&
			quantityRef &&
			context.account &&
			context.account.balances &&
			context.account.balances.length &&
			state.quantity.equals(defaultQuantity)
		) {
			const asset = Asset.from(quantity);
			quantityInput.set(asset);
			const balance = context.account.balances.find((b) => b.asset.symbol.equals(asset.symbol));
			if (balance) {
				tokenSelect.set(balance);
			}
			memoRef.focus();
			tick().then(() => f.send('next'));
		}
	});

	// Effect to handle needed state changes when setting the account
	$effect(() => {
		if (context.account) {
			const { name } = context.account;
			// Change the from field on the transfer
			if (name && state.from !== name) {
				f.send('reset');
			}

			// Set the balance to the default if it is not set
			if (
				state.quantity.equals(defaultQuantity) &&
				context.account.balances &&
				context.account.balances.length
			) {
				const balance = getDefaultBalance(data.network, context.account.balances);
				if (balance) {
					console.log('setting balance', JSON.stringify(balance));
					state.balance = balance;
					state.quantity = Asset.fromUnits(0, balance.asset.symbol);
					tokenSelect.set(balance);
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
			previous: reset
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

	function reset(): FormStates {
		// Reset the inputs
		if (toInput) {
			toInput.set('');
		}
		if (quantityInput) {
			quantityInput.set(null);
		}

		// Reset the form state itself
		state.reset();

		// Default back to the account as the sender
		if (context.account && context.account.name) {
			state.from = context.account.name;
		}

		// Focus the "to" input field
		tick().then(() => toRef?.focus());

		// Return the state it should reset to
		return 'to';
	}

	const subtitle = {
		to: 'Recipient',
		quantity: 'Asset',
		memo: 'Confirm',
		complete: 'Complete',
		error: 'Error'
	};

	const tokenOptions: TokenBalance[] = $derived.by(() => {
		if (context.account && context.account.balances && context.account.balances.length) {
			return context.account.balances;
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
				reset();
			} else {
				previous();
			}
		}
	}
</script>

<article class="layout-stack gap-4">
	<PageHeader title="Send" subtitle={subtitle[f.current]} />
	<Progress currentStep={progress} maxStep={3} />

	<div class="grid gap-4">
		<div class="space-y-4" class:hidden={f.current !== 'complete'}>
			<h2 class="h2">Transaction Complete</h2>
			<h3 class="h3">{transaction?.status}</h3>
			<p>
				<a href="/{data.network}/transaction/{id}">
					{id}
				</a>
			</p>
		</div>

		<div class:hidden={f.current !== 'error'}>
			<h2 class="h2">Transaction Error</h2>
			<p>There was an error submitting your transaction.</p>
		</div>

		<fieldset class="grid gap-2" class:hidden={f.current !== 'to'}>
			<Label for="to-input">Account Name</Label>
			<NameInput
				bind:this={toInput}
				bind:ref={toRef}
				bind:value={state.to}
				bind:valid={toValid}
				id="to-input"
				{onkeydown}
				placeholder="Enter the account name of the recipient"
			/>
		</fieldset>

		<fieldset class="grid gap-2" class:hidden={f.current !== 'quantity'}>
			<fieldset class="grid gap-2">
				<Label for="token-select">Select a token</Label>
				{#if tokenOptions.length && state.balance}
					<TokenSelect
						id="token-select"
						options={tokenOptions}
						bind:this={tokenSelect}
						bind:selected={state.balance}
						debug={debugMode.value}
					/>
				{:else}
					<p>No balances detected.</p>
				{/if}
			</fieldset>
			<Label for="quantity-input">Amount</Label>
			{#if state.balance}
				<AssetInput
					id="quantity-input"
					bind:this={quantityInput}
					bind:ref={quantityRef}
					bind:value={state.quantity}
					bind:valid={assetValid}
					bind:validPrecision={assetValidPrecision}
					bind:validMinimum={assetValidMinimum}
					bind:validMaximum={assetValidMaximum}
					min={state.min || 0}
					max={state.max || 0}
					{onkeydown}
					placeholder={`Enter the number of ${state.balance?.asset.symbol.code} tokens to send`}
					debug={debugMode.value}
				/>
			{/if}
			{#if context.account}
				<Label for="quantity-input">
					<button
						class="text-skyBlue-500 hover:text-skyBlue-400"
						disabled={!context.account}
						onclick={max}
						type="button">Fill Max</button
					>
				</Label>
			{/if}
			{#if assetValid && state.value}
				<Label for="quantity-input">Value: {formatCurrency(state.value)}</Label>
			{/if}
			{#if !assetValidPrecision}
				<p class="text-red-500">Invalid number, too many decimal places.</p>
			{/if}
			{#if !assetValidMaximum}
				<p class="text-red-500">Amount exceeds available balance.</p>
			{/if}
		</fieldset>

		<div class="grid grid-cols-3 gap-4 text-center" class:hidden={f.current !== 'memo'}>
			<div>
				<h2 class="h2">
					{state.from}
				</h2>
				<p>will send</p>
			</div>
			<div>
				<h2 class="h2">
					{state.quantity}
				</h2>
				{#if state.value}
					<p>
						{formatCurrency(state.value)}
					</p>
				{/if}
			</div>
			<div>
				<h2 class="h2">
					{state.to}
				</h2>
				<p>will receive</p>
			</div>
		</div>

		<fieldset class="grid gap-2" class:hidden={f.current !== 'memo'}>
			<Label for="memo-input">Memo</Label>
			<TextInput
				id="memo-input"
				bind:ref={memoRef}
				bind:value={state.memo}
				{onkeydown}
				placeholder="Specify a public memo for this transfer (optional)"
			/>
		</fieldset>

		<fieldset class="grid grid-cols-[50%_50%] gap-2 transition-all duration-200">
			{#if f.current === 'to'}
				<Button variant="secondary" onclick={() => f.send('reset')}>
					Reset
					{#if f.current === 'to'}
						[␛]
					{/if}
				</Button>
			{:else}
				<Button variant="secondary" type="button" onclick={previous}>Back [␛]</Button>
			{/if}

			{#if f.current === 'memo'}
				<Button class="col-end-3" type="button" onclick={transact} disabled={!allValid}
					>Submit [⏎]</Button
				>
			{:else}
				<Button class="col-end-3" type="submit" onclick={preventDefault(next)} disabled={!nextValid}
					>Next [⏎]</Button
				>
			{/if}
		</fieldset>
	</div>

	{#if debugMode.value}
		<h3 class="h3">Debugging</h3>
		<Code
			>{JSON.stringify(
				{
					state,
					price: state.price,
					value: state.value,
					current: f.current,
					balance: state.balance,
					max: state.max,
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
</article>
