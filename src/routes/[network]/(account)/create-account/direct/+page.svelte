<script lang="ts">
	import { Asset, Name, PublicKey } from '@wharfkit/antelope';
	import { getContext, onMount, tick } from 'svelte';
	import { FiniteStateMachine } from 'runed';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages';

	import { DD, DL, DLRow } from '$lib/components/descriptionlist/index.js';
	import { preventDefault } from '$lib/utils';
	import Label from '$lib/components/input/label.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import PublicKeyInput from '$lib/components/input/publickey.svelte';
	import NumberInput from '$lib/components/input/number.svelte';
	import { SingleCard, Stack } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Code from '$lib/components/code.svelte';
	import Checkbox from '$lib/components/input/checkbox.svelte';
	import { browser } from '$app/environment';
	import AccountText from '$lib/components/elements/account.svelte';

	const context = getContext<UnicoveContext>('state');

	let transactError = $state();

	let accountInput: NameInput | undefined = $state();
	let accountRef: HTMLInputElement | undefined = $state();
	let accountValid = $state(false);
	let accountName: Name = $state(Name.from(''));

	let activePublicKeyInput: PublicKeyInput | undefined = $state();
	let activePublicKeyRef: HTMLInputElement | undefined = $state();
	let activePublicKeyValid = $state(false);
	let activePublicKey: PublicKey | undefined = $state();

	let ownerPublicKeyInput: PublicKeyInput | undefined = $state();
	let ownerPublicKeyRef: HTMLInputElement | undefined = $state();
	let ownerPublicKeyValid = $state(false);
	let ownerPublicKey: PublicKey | undefined = $state();

	let ramBytesInput: NumberInput | undefined = $state();
	let ramBytesRef: HTMLInputElement | undefined = $state();
	let ramBytesValid = $state(true);
	let ramBytesUseCustom = $state(false);
	let ramBytesUseTransfer = $state(false);
	let ramBytes: number = $state(1700);
	let ramCost = $derived(
		ramBytesValid
			? Asset.fromUnits(
					context.network.resources.ram.price.rammarket.units.dividing(1000).multiplying(ramBytes),
					context.network.config.systemtoken.symbol
				)
			: undefined
	);

	let ramBytesMin = 1700;

	// The state which the submit form can exist in
	type FormStates = 'account' | 'publickey' | 'create' | 'complete' | 'error';

	// The events which can modify state
	type FormEvents = 'next' | 'previous' | 'reset' | 'success' | 'error';

	// For debugging, show all fields
	const showAll = false;

	const f = new FiniteStateMachine<FormStates, FormEvents>('account', {
		account: {
			next: () => 'publickey',
			reset,
			_enter: () => tick().then(() => accountRef?.focus())
		},
		publickey: {
			previous: 'account',
			next: () => 'create',
			reset,
			_enter: () => tick().then(() => ownerPublicKeyRef?.focus())
		},
		create: {
			previous: 'publickey',
			next: () => (transactError ? 'error' : 'complete')
		},
		complete: {
			reset
		},
		error: {
			previous: 'account',
			reset
		}
	});

	const next = () => f.send('next');
	const previous = () => f.send('previous');

	onMount(() => {
		accountRef?.focus();

		if (browser) {
			const params = page.url.searchParams;
			try {
				if (params.has('account')) {
					accountName = Name.from(params.get('account') as string);
					accountInput?.set(String(accountName));
				}
				if (params.has('active')) {
					activePublicKey = PublicKey.from(params.get('active') as string);
					activePublicKeyInput?.set(String(activePublicKey));
				}
				if (params.has('owner')) {
					ownerPublicKey = PublicKey.from(params.get('owner') as string);
					ownerPublicKeyInput?.set(String(ownerPublicKey));
				}
			} catch (e) {
				console.warn('Unable to process URL parameters', params, e);
			}
		}
	});

	function onkeydown(event: Event) {
		const { key } = event as KeyboardEvent;
		if (key === 'Enter') {
			next();
		}
		if (key === 'Escape') {
			if (f.current === 'account') {
				resetURL();
			} else {
				previous();
			}
		}
	}

	const nextValid = $derived.by(() => {
		switch (f.current) {
			case 'account':
				return accountValid;
			case 'publickey':
				return activePublicKeyValid && ownerPublicKeyValid;
		}
	});

	async function resetState() {
		// Reset the inputs
		if (accountInput) {
			accountInput.set('');
		}
		if (activePublicKeyInput) {
			activePublicKeyInput.set('');
		}
		if (ownerPublicKeyInput) {
			ownerPublicKeyInput.set('');
		}

		accountName = Name.from('');
		activePublicKey = undefined;
		ownerPublicKey = undefined;

		// Focus the "to" input field
		await tick();
		accountRef?.focus();
	}

	function reset(): FormStates {
		// Call reset
		resetState();

		// Return the state it should reset to
		return 'account';
	}

	async function resetURL() {
		await goto(`?${page.url.searchParams.toString()}`);
		f.send('reset');
	}

	let ready = $derived(
		accountValid &&
			activePublicKeyValid &&
			ownerPublicKeyValid &&
			ramBytesValid &&
			context.wharf.session &&
			!context.wharf.transacting
	);

	async function transact() {
		if (!context.wharf.session || !accountName || !activePublicKey || !ownerPublicKey) {
			return;
		}

		transactError = undefined;

		const contract = context.network.contracts.system;
		const actions = [
			contract.action('newaccount', {
				creator: context.wharf.session.actor,
				name: accountName,
				owner: {
					accounts: [],
					keys: [{ key: ownerPublicKey, weight: 1 }],
					threshold: 1,
					waits: []
				},
				active: {
					accounts: [],
					keys: [{ key: activePublicKey, weight: 1 }],
					threshold: 1,
					waits: []
				}
			})
		];
		if (ramBytesUseTransfer) {
			const ramtransfer = contract.action('ramtransfer', {
				from: context.wharf.session.actor,
				to: accountName,
				bytes: ramBytes,
				memo: ''
			});
			actions.push(ramtransfer);
		} else {
			const buyrambytes = contract.action('buyrambytes', {
				payer: context.wharf.session.actor,
				receiver: accountName,
				bytes: ramBytes
			});
			actions.push(buyrambytes);
		}

		// NYI: giftram
		// const giftram = contract.action('giftram', {
		// 	from: context.wharf.session.actor,
		// 	to: accountName,
		// 	bytes: ramBytes,
		// 	memo: ''
		// });

		try {
			await context.wharf.transact({ actions });
		} catch (e) {
			console.error(e);
			transactError = e;
		} finally {
			f.send('next');
		}
	}
</script>

{#snippet AccountName()}
	<fieldset class="grid gap-2" class:hidden={!showAll && f.current !== 'account'}>
		<Label for="account-input">Account Name</Label>
		<NameInput
			bind:this={accountInput}
			bind:ref={accountRef}
			bind:value={accountName}
			bind:valid={accountValid}
			{onkeydown}
			id="account-input"
			placeholder="Account Name"
		/>
	</fieldset>
{/snippet}

{#snippet PublicKeys()}
	<fieldset class="grid gap-2" class:hidden={!showAll && f.current !== 'publickey'}>
		<Label for="owner-public-key-input">Owner Public Key</Label>
		<PublicKeyInput
			bind:this={ownerPublicKeyInput}
			bind:ref={ownerPublicKeyRef}
			bind:value={ownerPublicKey}
			bind:valid={ownerPublicKeyValid}
			{onkeydown}
			id="owner-public-key-input"
			placeholder="Owner Public Key"
		/>
	</fieldset>

	<fieldset class="grid gap-2" class:hidden={!showAll && f.current !== 'publickey'}>
		<Label for="active-public-key-input">Active Public Key</Label>
		<PublicKeyInput
			bind:this={activePublicKeyInput}
			bind:ref={activePublicKeyRef}
			bind:value={activePublicKey}
			bind:valid={activePublicKeyValid}
			{onkeydown}
			id="active-public-key-input"
			placeholder="Active Public Key"
		/>
	</fieldset>
{/snippet}

{#snippet RAMBytes()}
	<div class="space-y-6">
		<DL>
			<DLRow title="Account Name">
				<DD>
					{accountName}
				</DD>
			</DLRow>
			<DLRow title="Owner Key">
				<DD>
					{ownerPublicKey}
				</DD>
			</DLRow>
			<DLRow title="Active Key">
				<DD>
					{activePublicKey}
				</DD>
			</DLRow>
			<DLRow title="RAM Bytes">
				<DD>
					{ramBytes}
				</DD>
			</DLRow>
		</DL>
		<fieldset class="flex items-center gap-3">
			<Checkbox bind:checked={ramBytesUseCustom} id="rambytes-custom" />
			<Label for="rambytes-custom">Change RAM options for new account</Label>
		</fieldset>
		<fieldset class="grid gap-3">
			{#if ramBytesUseCustom}
				<SingleCard>
					<Stack>
						<Label for="account-input"
							>RAM bytes to purchase for new account (min: {ramBytesMin})</Label
						>
						<NumberInput
							bind:this={ramBytesInput}
							bind:ref={ramBytesRef}
							bind:value={ramBytes}
							bind:valid={ramBytesValid}
							{onkeydown}
							id="ramBytes-input"
							placeholder="RAM (Bytes)"
							min={ramBytesMin}
						/>
						{#if context.settings.data.advancedMode}
							<fieldset class="flex items-center gap-3">
								<Checkbox bind:checked={ramBytesUseTransfer} id="rambytes-transfer" />
								<Label for="rambytes-transfer">
									Transfer RAM from my account: {context.wharf.session?.actor}
								</Label>
							</fieldset>
						{/if}
					</Stack>
				</SingleCard>
			{/if}
		</fieldset>
	</div>
{/snippet}

{#snippet Create()}
	<div class="grid gap-2" class:hidden={!showAll && f.current !== 'create'}>
		{@render RAMBytes()}
		<Button disabled={!ready} onclick={() => transact()}>
			Create Account
			{#if ramBytesUseTransfer}
				by transferring {ramBytes} bytes of RAM
			{:else}
				by paying {ramCost} for RAM
			{/if}
		</Button>
		{#if !context.wharf.session}
			<p class="text-center text-red-500">
				You must be logged in with an existing account in order to create another account on this
				page.
			</p>
		{/if}
	</div>
{/snippet}

{#snippet ButtonGroup()}
	<fieldset class="flex gap-2 *:flex-1" class:hidden={f.current === 'create' || showAll}>
		{#if f.current === 'account' || f.current === 'complete'}
			<Button variant="secondary" onclick={() => resetURL()}>{m.common_restart()}</Button>
		{:else}
			<Button variant="secondary" onclick={previous}>{m.common_back()}</Button>
		{/if}

		<Button class="col-end-3" type="submit" onclick={preventDefault(next)} disabled={!nextValid}>
			{m.common_next()}
		</Button>
	</fieldset>
{/snippet}

{#snippet TransactError()}
	<div class:hidden={f.current !== 'error'}>
		<h3 class="h3 mb-4">An error occurred</h3>
		<p>{transactError}</p>
	</div>
{/snippet}

{#snippet TransactResult()}
	<div class:hidden={f.current !== 'complete'}>
		<h3 class="h3 mb-4">Account Created</h3>
		<p>The <AccountText name={accountName} /> account was successfully created.</p>
	</div>
{/snippet}

<SingleCard>
	<Stack>
		{@render AccountName()}

		{@render PublicKeys()}

		{@render Create()}

		{@render TransactResult()}

		{@render TransactError()}

		{@render ButtonGroup()}
	</Stack>
</SingleCard>

{#if context.settings.data.debugMode}
	<h3 class="h3">{m.common_debugging()}</h3>
	<Code
		>{JSON.stringify(
			{
				ramCost,
				ramBytesUseCustom,
				ramBytesUseTransfer,
				values: {
					accountName,
					activePublicKey,
					ownerPublicKey,
					ramBytes
				},
				valid: {
					accountValid,
					activePublicKeyValid,
					ownerPublicKeyValid,
					ramBytesValid
				}
			},
			undefined,
			2
		)}</Code
	>
{/if}
