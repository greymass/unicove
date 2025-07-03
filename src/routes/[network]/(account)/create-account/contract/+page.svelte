<script lang="ts">
	import { Asset, Name, PrivateKey, PublicKey } from '@wharfkit/antelope';
	import { getContext, onMount, tick } from 'svelte';
	import { FiniteStateMachine } from 'runed';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages';

	import { preventDefault } from '$lib/utils';
	import Label from '$lib/components/input/label.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import PublicKeyInput from '$lib/components/input/publickey.svelte';
	import { TextInput } from 'unicove-components';
	import { SingleCard, Stack } from '$lib/components/layout';
	import {Button} from 'unicove-components';
	import {CopyButton} from 'unicove-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import {Code} from 'unicove-components';
	import Checkbox from '$lib/components/input/checkbox.svelte';
	import ContractKit from '@wharfkit/contract';
	import { browser } from '$app/environment';

	const context = getContext<UnicoveContext>('state');

	let accountInput: NameInput | undefined = $state();
	let accountRef: HTMLInputElement | undefined = $state();
	let accountValid = $state(false);
	let accountName: Name = $state(Name.from(''));

	let publicKeyInput: PublicKeyInput | undefined = $state();
	let publicKeyRef: HTMLInputElement | undefined = $state();
	let publicKeyValid = $state(false);
	let publicKey: PublicKey | undefined = $state();

	let privateKeyInput: TextInput | undefined = $state();
	let privateKeyRef: HTMLInputElement | undefined = $state();
	let privateKey: PrivateKey | undefined = $state();
	let privateKeyCopied = $state(false);

	let cost: Asset | undefined = $state();
	let costAmount: string | undefined = $derived(cost?.quantity);
	let memo: string = $derived(`${accountName}:${publicKey?.toLegacyString()}`);

	let sendAccount: string = $state('openaccounts');

	// The state which the submit form can exist in
	type FormStates =
		| 'account'
		| 'publickey'
		| 'privatekey'
		| 'create'
		| 'creating'
		| 'complete'
		| 'error';

	// The events which can modify state
	type FormEvents = 'next' | 'previous' | 'generate' | 'reset' | 'success' | 'error';

	// For debugging, show all fields
	const showAll = false;

	const f = new FiniteStateMachine<FormStates, FormEvents>('account', {
		account: {
			next: () => (accountValid ? 'publickey' : 'account'),
			reset,
			_enter: () => tick().then(() => accountRef?.focus())
		},
		publickey: {
			previous: 'account',
			next: () => (publicKeyValid ? 'create' : 'publickey'),
			generate: () => 'privatekey',
			reset,
			_enter: () => tick().then(() => publicKeyRef?.focus())
		},
		privatekey: {
			previous: 'publickey',
			next: () => 'create'
		},
		create: {
			previous: 'publickey'
		},
		creating: {},
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
			const contractKit = new ContractKit({
				client: context.network.client
			});
			// Get account creation cost from the contract
			contractKit.load('openaccounts').then((contract) => {
				contract.readonly('estimatecost').then((result) => {
					const modified = Asset.from(result);
					modified.units.add(2000); // Add buffer of 0.2000 EOS
					cost = modified;
				});
			});
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
				return publicKeyValid;
			case 'privatekey':
				return privateKeyCopied;
		}
	});

	async function resetState() {
		// Reset the inputs
		if (accountInput) {
			accountInput.set('');
		}
		if (publicKeyInput) {
			publicKeyInput.set('');
		}
		if (privateKeyInput) {
			privateKeyInput?.set('');
		}

		accountName = Name.from('');
		publicKey = undefined;
		privateKey = undefined;

		// Focus the "to" input field
		await tick();
		accountRef?.focus();
	}

	function generate() {
		privateKey = PrivateKey.generate('K1');
		privateKeyInput?.set(String(privateKey));
		const pubkey = privateKey.toPublic();
		publicKeyInput?.set(String(pubkey));
		f.send('generate');
	}

	function reset(): FormStates {
		// Call reset
		resetState();

		// Return the state it should reset to
		return 'account';
	}

	async function resetURL() {
		await goto(`?${$page.url.searchParams.toString()}`);
		f.send('reset');
	}
</script>

{#snippet AccountName()}
	<fieldset class="grid gap-2" class:hidden={!showAll && f.current !== 'account'}>
		<Label for="account-input">{m.common_account_name()}</Label>
		<NameInput
			bind:this={accountInput}
			bind:ref={accountRef}
			bind:value={accountName}
			bind:valid={accountValid}
			{onkeydown}
			id="account-input"
			placeholder={m.common_account_name()}
		/>
	</fieldset>
{/snippet}

{#snippet PublicKey()}
	<fieldset class="grid gap-2" class:hidden={!showAll && f.current !== 'publickey'}>
		<Label for="public-key-input">{m.common_public_key}</Label>
		<PublicKeyInput
			bind:this={publicKeyInput}
			bind:ref={publicKeyRef}
			bind:value={publicKey}
			bind:valid={publicKeyValid}
			{onkeydown}
			id="public-key-input"
			placeholder={m.common_public_key()}
		/>
		<Button variant="secondary" onclick={generate}>{m.common_generate_key()}</Button>
	</fieldset>
{/snippet}

{#snippet Generate()}
	<div class:hidden={!showAll && f.current !== 'privatekey'}>
		<fieldset class="grid gap-2">
			<Label for="private-key-input"
				>{m.common_private_key()} <CopyButton data={String(privateKey)} /></Label
			>

			<TextInput
				bind:ref={privateKeyRef}
				bind:value={privateKey}
				disabled
				id="private-key-input"
				placeholder={m.common_private_key()}
			>
				<CopyButton data={String(privateKey)} />
			</TextInput>
		</fieldset>
		<p class="my-3 flex items-center gap-3">
			{m.common_private_key_safety_warning()}
		</p>
		<fieldset class="flex items-center gap-3" class:hidden={!showAll && f.current !== 'privatekey'}>
			<Checkbox id="private-key-copied" bind:checked={privateKeyCopied} />
			<Label for="private-key-copied">{m.common_private_key_safety_ack()}</Label>
		</fieldset>
	</div>
{/snippet}

{#snippet Create()}
	<div class="grid gap-2" class:hidden={!showAll && f.current !== 'create'}>
		<h2 class="h2 flex gap-2">{m.common_instructions()}</h2>
		<p class="flex gap-2">
			{m.common_create_account_by_sending()}
		</p>
		<fieldset class="grid gap-2">
			<Label for="send-account-input">
				{m.common_send_token_to_account({
					token: context.network.token.name
				})}
			</Label>

			{#if cost}
				<TextInput is="send-account-input" value={sendAccount} disabled>
					<CopyButton data={sendAccount} />
				</TextInput>
			{/if}
		</fieldset>

		<fieldset class="grid gap-2">
			<Label for="cost-amount-input">
				{m.common_send_token_amount({
					token: context.network.token.name
				})}
			</Label>

			{#if cost}
				<TextInput id="cost-amount-input" value={costAmount} disabled>
					<CopyButton data={String(costAmount)} />
				</TextInput>
			{/if}
		</fieldset>

		<fieldset class="grid gap-2">
			<Label for="memo-input">{m.common_transfer_memo()}</Label>

			<TextInput id="memo-input" value={memo} disabled>
				<CopyButton data={String(memo)} />
			</TextInput>
		</fieldset>

		<p class="flex gap-2">
			{m.common_create_account_by_sending_complete()}
		</p>
	</div>
{/snippet}

{#snippet ButtonGroup()}
	<fieldset class="flex gap-2 *:flex-1" class:hidden={f.current === 'create'}>
		{#if f.current === 'account'}
			<Button variant="secondary" onclick={() => resetURL()}>{m.common_restart()}</Button>
		{:else}
			<Button variant="secondary" onclick={previous}>{m.common_back()}</Button>
		{/if}

		<Button class="col-end-3" type="submit" onclick={preventDefault(next)} disabled={!nextValid}>
			{m.common_next()}
		</Button>
	</fieldset>
{/snippet}

<SingleCard>
	<Stack>
		{@render AccountName()}

		{@render PublicKey()}

		{@render Generate()}

		{@render Create()}

		{@render ButtonGroup()}
	</Stack>
</SingleCard>

{#if context.settings.data.debugMode}
	<h3 class="h3">{m.common_debugging()}</h3>
	<Code
		>{JSON.stringify(
			{
				cost,
				values: {
					accountName,
					publicKey,
					privateKey
				},
				valid: {
					accountValid,
					publicKeyValid
				}
			},
			undefined,
			2
		)}</Code
	>
{/if}
