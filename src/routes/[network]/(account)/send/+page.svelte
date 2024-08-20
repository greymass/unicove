<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import type { Checksum256 } from '@wharfkit/session';
	import { getContext, onMount, tick } from 'svelte';
	import { FiniteStateMachine, type ActionFn, type Action as StateAction } from 'runed';

	import * as m from '$lib/paraglide/messages.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Code from '$lib/components/code.svelte';
	import Label from '$lib/components/input/label.svelte';
	import TextInput from '$lib/components/input/textinput.svelte';

	import { SendState } from './state.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const state: SendState = $state(new SendState());
	let chain: Checksum256 | undefined = $state();
	let assetInput: AssetInput = $state();

	let assetRef = $state();
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
		if (data.network.systemtoken && context.account && context.account.balance) {
			assetInput.set(context.account.balance.liquid);
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
			_enter: () => tick().then(() => assetRef?.focus())
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
	let toValid = $state(true); // TODO: Implement validation

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
	const next = () => f.send('next');
	const previous = () => f.send('previous');

	function complete() {
		alert('complete!');
	}

	function reset(): FormStates {
		// Reset the form state itself
		state.reset();

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

{#if chain}
	{toValid} / {assetValid} / {memoValid}
	<form onsubmit={preventDefault(next)}>
		<fieldset class="grid gap-3" class:hidden={f.current !== 'to'}>
			<Label for="labeled-input">Account Name</Label>
			<TextInput bind:ref={toRef} bind:value={state.to} />
		</fieldset>
		<fieldset class="grid gap-3" class:hidden={f.current !== 'quantity'}>
			<Label for="labeled-input">Amount</Label>
			<AssetInput
				id="assetInput"
				bind:this={assetInput}
				bind:ref={assetRef}
				bind:value={state.quantity}
				bind:valid={assetValid}
				max={state.max}
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
			<Label for="labeled-input">Memo</Label>
			<TextInput
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

	<hr class="my-12" />

	<h3 class="h3">Current State: {f.current}</h3>
	<Code>{JSON.stringify(state, undefined, 2)}</Code>
	<Button onclick={() => f.send('reset')}>Reset</Button>
{/if}
