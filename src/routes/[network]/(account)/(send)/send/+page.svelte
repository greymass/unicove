<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import type { Checksum256 } from '@wharfkit/session';
	import { getContext, onMount, tick } from 'svelte';
	import { FiniteStateMachine } from 'runed';

	import type { UnicoveContext } from '$lib/state/client.svelte';

	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import Progress from '$lib/components/progress.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import TextInput from '$lib/components/input/textinput.svelte';

	import { SendState } from './state.svelte';
	import { page } from '$app/stores';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const state: SendState = $state(new SendState(data.network.chain));
	let chain: Checksum256 | undefined = $state(data.network.chain.id);

	let quantityInput: AssetInput = $state();
	let toInput: NameInput = $state();

	let quantityRef = $state();
	let toRef = $state();
	let memoRef = $state();

	async function test() {
		if (!context.wharf || !context.wharf.session) {
			return;
		}
		if (data.network.contracts.token) {
			const action = data.network.contracts.token.action('transfer', state.toJSON());
			context.wharf.transact({ action });
		} else {
			alert('Not logged in');
		}
	}

	function max() {
		if (context.account && context.account.balance) {
			quantityInput.set(context.account.balance.liquid);
		}
	}

	$effect(() => {
		if (data.network.chain.id && (!chain || !data.network.chain.id.equals(chain))) {
			chain = data.network.chain.id;
		}
	});

	$effect(() => {
		if (context.account && context.account.name) {
			state.from = context.account.name;
			state.max = context.account.balance?.liquid.value;
		}
	});

	onMount(() => {
		if (data.network && data.network.systemtoken) {
			state.quantity = Asset.fromUnits(0, data.network.systemtoken);
		}
	});

	// The state which the submit form can exist in
	type FormStates = 'to' | 'quantity' | 'memo' | 'confirm';

	// The events which can modify state
	type FormEvents = 'next' | 'previous' | 'reset';

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
			next: () => (memoValid ? 'confirm' : 'memo'),
			reset,
			_enter: () => tick().then(() => memoRef?.focus())
		},
		confirm: {
			previous: 'memo',
			next: 'to',
			reset
		}
	});

	let assetValid = $state(false);
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
			case 'memo':
				return 3;
			case 'confirm':
				return 4;
		}
	});

	const next = () => f.send('next');
	const previous = () => f.send('previous');

	function complete() {
		alert('complete!');
	}

	function reset(): FormStates {
		// Reset the form state itself
		state.reset();

		// Reset all the inputs
		toInput.set('');
		quantityInput.set(null);

		// Focus the "to" input field
		tick().then(() => toRef?.focus());

		// Return the state it should reset to
		return 'to';
	}

	function preventDefault(fn: (event: Event) => void) {
		return function (event: Event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}
</script>

<header class="layout-stack gap-6">
	<Stack class="gap-2">
		<h1 class="h1 font-bold leading-none text-white">Send</h1>
		{#if f.current === 'to'}
			<h3 class="h3 text-white/60">Add recipient</h3>
		{:else if f.current === 'quantity'}
			<h3 class="h3 text-white/60">Enter the amount of tokens</h3>
		{:else if f.current === 'memo'}
			<h3 class="h3 text-white/60">Add an optional memo</h3>
		{:else if f.current === 'confirm'}
			<h3 class="h3 text-white/60">Confirm this is correct</h3>
		{/if}
	</Stack>
</header>

<Progress currentStep={progress} maxStep={3} />

<form onsubmit={preventDefault(next)}>
	<fieldset class="grid gap-3" class:hidden={f.current !== 'to'}>
		<Label for="to-input">Account Name</Label>
		<NameInput
			bind:this={toInput}
			bind:ref={toRef}
			bind:value={state.to}
			bind:valid={toValid}
			id="to-input"
		/>
	</fieldset>
	<fieldset class="grid gap-3" class:hidden={f.current !== 'quantity'}>
		<Label for="quantity-input">Amount</Label>
		<AssetInput
			id="quantity-input"
			bind:this={quantityInput}
			bind:ref={quantityRef}
			bind:value={state.quantity}
			bind:valid={assetValid}
			max={state.max || 0}
		/>
		<p>
			Available:
			{#if context.account}
				{context.account.balance?.liquid}
				<Button disabled={!context.account} onclick={preventDefault(max)} type="button"
					>Fill Max</Button
				>
			{:else}
				0.0000
			{/if}
		</p>
	</fieldset>
	<fieldset class="grid gap-3" class:hidden={f.current !== 'memo'}>
		<Label for="memo-input">Memo</Label>
		<TextInput
			id="memo-input"
			bind:ref={memoRef}
			bind:value={state.memo}
			placeholder="Record a public memo for this transfer (optional)"
		/>
	</fieldset>
	<fieldset class="grid gap-3" class:hidden={f.current !== 'confirm'}>
		<h3 class="h3">Confirm Transaction</h3>
		<Code>{JSON.stringify(state, undefined, 2)}</Code>
	</fieldset>
	{#if f.current === 'confirm'}
		<Button type="submit" onclick={preventDefault(complete)} disabled={!allValid}>Submit</Button>
	{:else}
		<Button type="submit" onclick={preventDefault(next)} disabled={!nextValid}>Next</Button>
	{/if}
	{#if f.current !== 'to'}
		<Button type="button" onclick={preventDefault(previous)}>Back</Button>
	{/if}
</form>

<h3 class="h3">Debugging</h3>
<Code
	>{JSON.stringify(
		{ state, current: f.current, valid: { toValid, assetValid, memoValid } },
		undefined,
		2
	)}</Code
>
<Button onclick={() => f.send('reset')}>Reset</Button>
