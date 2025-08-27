<script lang="ts">
	import { getContext, onMount, tick } from 'svelte';
	import { FiniteStateMachine } from 'runed';
	import {
		Card,
		TextInput,
		Button,
		Code,
		NameInput,
		NumberInput,
		Table,
		TD,
		TH,
		TR,
		Account,
		Asset as AssetElement
	} from 'unicove-components';
	import * as m from '$lib/paraglide/messages';

	import * as RegistryContract from '$lib/wharf/contracts/registry';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Asset, Checksum256, UInt64 } from '@wharfkit/antelope';
	import TransactForm from '$lib/components/transact/form.svelte';
	import { type AllocationInput, createTokenRAMCosts, CreateTokenState } from './state.svelte';

	const context = getContext<UnicoveContext>('state');

	const tokenState = new CreateTokenState();
	onMount(async () => {
		await tokenState.init(context);
	});

	$effect(() => {
		const name = String(tokenState.ticker.value);
		if (name && tokenState.ticker.valid) {
			tokenState.tickerCheck = true;
			tokenState.tickerAvailable = false;
			context.network.contracts.registry
				.table('tokens')
				.get(Asset.SymbolCode.from(name).value)
				.then((token) => {
					if (!token) {
						tokenState.tickerAvailable = true;
					}
				})
				.catch((error) => {
					console.warn('error during token ticker lookup', error);
					tokenState.tickerAvailable = false;
				})
				.finally(() => {
					tokenState.tickerCheck = false;
				});
		}
	});

	type FormStep = 'welcome' | 'ticker' | 'supply' | 'allocation' | 'preview' | 'complete';

	type FormEvent = 'next' | 'previous' | 'reset' | 'success' | 'error';

	const f = new FiniteStateMachine<FormStep, FormEvent>('ticker', {
		welcome: {
			next: 'ticker'
		},
		ticker: {
			next: () => (currentStepValid ? 'supply' : 'ticker'),
			reset,
			_enter: () => tick().then(() => tokenState.ticker.ref?.focus())
		},
		supply: {
			next: () => (currentStepValid ? 'allocation' : 'supply'),
			previous: 'ticker',
			reset,
			_enter: () => tick().then(() => tokenState.precision.ref?.focus())
		},
		allocation: {
			next: () => (currentStepValid ? 'preview' : 'allocation'),
			previous: 'supply',
			reset
		},
		preview: {
			next: () => (currentStepValid ? 'complete' : 'preview'),
			previous: 'allocation',
			reset
		},
		complete: {
			reset
		}
	});

	const next = () => f.send('next');
	const previous = () => f.send('previous');

	const currentStepValid = $derived.by(() => {
		switch (f.current) {
			case 'ticker': {
				return tokenState.ticker.valid && tokenState.tickerAvailable;
			}
			case 'supply': {
				return tokenState.precision.valid && tokenState.supply.valid;
			}
			case 'allocation': {
				return tokenState.allocationsValid;
			}
			case 'preview': {
				return tokenState.valid;
			}
			default: {
				return true;
			}
		}
	});

	function reset(): FormStep {
		return 'ticker';
	}

	function onInputKeyboardEvent(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			next();
		}
	}

	let id: Checksum256 | undefined = $state();
	let error: string | undefined = $state();

	async function transact() {
		if (!context.account) {
			throw new Error('No account selected');
		}
		if (!context.wharf.contractKit) {
			throw new Error('ContractKit not available');
		}
		const tokenContract = await context.wharf.contractKit.load(
			tokenState.tokenStandardContractName
		);
		const actions = tokenState.getActions(context.account.name, tokenContract);
		context.wharf
			.transact({ actions }, { broadcast: false })
			.then((result) => {
				id = result?.resolved?.transaction.id;
				f.send('success');
			})
			.catch((e) => {
				console.error('Transaction error', e);
				error = e;
				f.send('error');
			});
	}
</script>

{#snippet TickerInput()}
	<TextInput
		id="ticker-input"
		label="Token Ticker"
		placeholder={`Enter a ${tokenState.minlength}-${tokenState.maxlength} letter token ticker...`}
		onkeyup={onInputKeyboardEvent}
		bind:ref={tokenState.ticker.ref}
		bind:value={tokenState.ticker.value}
	/>
{/snippet}

{#snippet PrecisionInput()}
	<TextInput
		id="precision-input"
		label="Token Precision"
		type="number"
		min="0"
		max="18"
		placeholder="Enter token precision..."
		onkeyup={onInputKeyboardEvent}
		bind:ref={tokenState.precision.ref}
		bind:value={tokenState.precision.value}
	/>
{/snippet}

{#snippet SupplyInput()}
	<TextInput
		id="supply-input"
		label="Token Supply"
		placeholder={`Enter token supply...`}
		onkeyup={onInputKeyboardEvent}
		bind:ref={tokenState.supply.ref}
		bind:value={tokenState.supply.value}
	/>
{/snippet}

{#snippet AllocationCustom(allocation: AllocationInput)}
	{#key allocation.id}
		<Card>
			<NameInput
				label="Receiving Account"
				placeholder="Account name..."
				bind:value={allocation.receiver}
				bind:valid={allocation.receiverValid}
			/>
			<NumberInput
				label="Quantity"
				placeholder="Token quantity..."
				min={1}
				bind:value={allocation.quantity}
				bind:valid={allocation.quantityValid}
			/>
			<Button variant="pill" onclick={() => tokenState.removeAllocation(allocation.id)}>
				Remove
			</Button>
		</Card>
	{/key}
{/snippet}

{#snippet AllocationStep()}
	{#each tokenState.allocations as allocation}
		{@render AllocationCustom(allocation)}
	{/each}
	<Button onclick={tokenState.addAllocation}>Add Allocation</Button>
{/snippet}

{#snippet TickerAvailable()}
	<p>
		Status:
		{#if tokenState.ticker.valid}
			{#if tokenState.tickerCheck}
				Checking availability...
			{:else if tokenState.tickerAvailable}
				Available to register
			{:else}
				Already registered
			{/if}
		{:else}
			Invalid Ticker
		{/if}
	</p>
{/snippet}

{#snippet TickerStep()}
	{@render TickerInput()}
	{@render TickerAvailable()}
	<p>Rules</p>
	<ul>
		<li>Must be all uppercase letters (no numbers or special characters)</li>
		<li>Must be at least {tokenState.minlength} characters</li>
		<li>Must be at most {tokenState.maxlength} characters</li>
	</ul>
{/snippet}

{#snippet SupplyStep()}
	{@render PrecisionInput()}
	{@render SupplyInput()}
	<p>Supply Preview: {tokenState.supplyPreview}</p>
	<p>Rules</p>
	<ul>
		<li>Must be a positive integer</li>
		<li>Must be at least 1</li>
		<li>Must not exceed {String(UInt64.max)}</li>
	</ul>
{/snippet}

{#snippet ButtonGroup()}
	{#if f.current === 'complete'}{:else if f.current === 'preview'}
		<Button onclick={transact} disabled={!tokenState.valid}>Create</Button>
	{:else}
		<Button onclick={next} disabled={!currentStepValid}>Next</Button>
	{/if}

	{#if f.current === 'complete'}
		<Button href="#" variant="primary">View Token</Button>
	{:else}
		<Button onclick={previous} disabled={f.current === 'ticker'} variant="secondary">Back</Button>
	{/if}
{/snippet}

{#snippet Success()}
	<div class="flex gap-4">
		<Button variant="secondary" onclick={() => (id = undefined)}>{m.common_back()}</Button>
		<Button href={`/${context.network}/account/${context.account?.name}`}>
			{m.common_view_my_account()}
		</Button>
	</div>
{/snippet}

{#snippet Failure()}
	<div class="flex gap-4">
		<Button onclick={() => (error = undefined)}>{m.common_back()}</Button>
	</div>
{/snippet}

{#snippet Preview()}
	<h2>Preview</h2>
	<p>Review the information below and click Create to create your token.</p>
	<Card>
		<ul>
			<li>Token Ticker: {tokenState.ticker.value}</li>
			<li>Token Precision: {tokenState.precision.value}</li>
			<li>
				Token Supply:
				<AssetElement variant="full" value={tokenState.supplyPreview} />
			</li>
		</ul>
	</Card>
	<Card>
		<Table>
			{#snippet thead()}
				<TH class="text-lg font-bold">Receiving Account</TH>
				<TH class="text-lg font-bold">Quantity</TH>
			{/snippet}
			{#each tokenState.allocations as allocation}
				<TR>
					<TD>
						<Account
							target="blank"
							href={`/${context.network}/account/${allocation.receiver}`}
							name={allocation.receiver}
						/>
					</TD>
					<TD>
						<AssetElement
							variant="full"
							value={Asset.fromFloat(
								Number(allocation.quantity),
								`${tokenState.precision.value},${tokenState.ticker.value}`
							)}
						/>
					</TD>
				</TR>
			{/each}
		</Table>
	</Card>
	<Card>
		<Table>
			{#snippet thead()}
				<TH class="text-lg font-bold">Fee</TH>
				<TH class="text-lg font-bold">Cost</TH>
			{/snippet}
			<TR>
				<TD>Registration Fee</TD>
				<TD>
					{tokenState.registryConfig?.fees.regtoken}
				</TD>
			</TR>
			<TR>
				<TD>Estimated RAM Usage</TD>
				<TD>
					{createTokenRAMCosts.base + createTokenRAMCosts.perOpen * tokenState.allocations.length}
					bytes
				</TD>
			</TR>
		</Table>
	</Card>
{/snippet}

{#snippet Welcome(config: RegistryContract.Types.config_row)}
	<h2>Welcome</h2>
	<p>As a token creator, you will:</p>
	<ul>
		<li>Pay a fee of {config.fees.regtoken}</li>
		<li>
			Pay the fees required for the network resources (CPU, NET, RAM) to perform the creation and
			distribution.
		</li>
		<li>Select an available token ticker</li>
		<li>Select a type of token</li>
		<li>Define the tokens decimal precision and maximum supply</li>
		<li>Set the tokens initial distribution</li>
	</ul>
{/snippet}

<TransactForm {id} {error} onsuccess={Success} onfailure={Failure}>
	{#if tokenState.registryConfig}
		{#if f.current === 'welcome'}
			{@render Welcome(tokenState.registryConfig)}
		{/if}

		{#if f.current === 'ticker'}
			{@render TickerStep()}
		{/if}

		{#if f.current === 'supply'}
			{@render SupplyStep()}
		{/if}

		{#if f.current === 'allocation'}
			{@render AllocationStep()}
		{/if}

		{#if f.current === 'preview'}
			{@render Preview()}
		{/if}

		{@render ButtonGroup()}
	{:else}
		<p>Loading {context.network} Registry...</p>
	{/if}
</TransactForm>

{#if context.settings.data.debugMode}
	{#if f.current === 'ticker'}
		<Code json={tokenState.ticker} />
	{/if}

	{#if f.current === 'supply'}
		<Code
			json={{
				precision: tokenState.precision,
				supply: tokenState.supply
			}}
		/>
	{/if}

	{#if f.current === 'allocation'}
		<Code json={tokenState.allocations} />
	{/if}

	<h2>Form State</h2>
	<Code json={tokenState} />
{/if}
