<script lang="ts">
	import { getContext, onMount, tick } from 'svelte';
	import { Debounced, FiniteStateMachine } from 'runed';
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
	import { Asset, Checksum256, Name, UInt64 } from '@wharfkit/antelope';
	import TransactForm from '$lib/components/transact/form.svelte';

	const context = getContext<UnicoveContext>('state');

	let registryConfig: RegistryContract.Types.config_row | undefined = $state();
	onMount(async () => {
		registryConfig = await context.network.contracts.registry.table('config').get();
	});

	const baseRAMCost = 513;
	const perOpenRAMCost = 240;

	let minlength = $derived(Number(registryConfig?.regtoken.minlength) || 1);
	const maxlength = 7;

	function validateTicker(value: string) {
		const trimmedValue = value.trim();
		return (
			trimmedValue.length >= minlength &&
			trimmedValue.length <= maxlength &&
			/^[A-Z]+$/.test(trimmedValue)
		);
	}

	function validateSupply(value: string) {
		if (value === '') return false;
		const numValue = Number(value);
		return numValue > 0 && String(UInt64.from(numValue)) === value;
	}

	function validatePrecision(value: string) {
		if (value === '') return false;
		const numValue = Number(value);
		return numValue >= 0 && numValue <= 18;
	}

	let tokenContractName = $state('tokens.gm');
	let tickerValue = $state('');
	const tickerValueDebounced = new Debounced(() => tickerValue, 500);
	let tickerAvailable = $state(false);
	let tickerValid = $derived.by(() => validateTicker(tickerValue));
	let tickerRef: HTMLInputElement | undefined = $state();

	let precisionValue = $state('');
	let precisionValid = $derived.by(() => validatePrecision(precisionValue));
	let precisionRef: HTMLInputElement | undefined = $state();

	let supplyValue = $state('');
	let supplyValid = $derived.by(() => validateSupply(supplyValue));
	let supplyRef: HTMLInputElement | undefined = $state();

	interface AllocationInput {
		id: number;
		receiver: string;
		receiverValid: boolean;
		quantity: number | undefined;
		quantityValid: boolean;
	}

	let allocations: AllocationInput[] = $state([
		{
			id: 1,
			receiver: '',
			// receiver: 'test',
			receiverValid: false,
			quantity: undefined,
			// quantity: 1000,
			quantityValid: false
		}
	]);

	let allocationsValidNames = $derived.by(() => {
		return allocations.every((allocation) => {
			const validName = Name.from(allocation.receiver).equals(allocation.receiver);
			return validName;
		});
	});

	let allocationsValidQuantities = $derived.by(() => {
		return allocations.every((allocation) => {
			const greaterThanZero = Number(allocation.quantity) > 0;
			return greaterThanZero;
		});
	});

	let allocationsValidTotalQuantity = $derived.by(() => {
		const total = allocations.reduce((sum, allocation) => {
			const quantity = Number(allocation.quantity);
			return sum + (isNaN(quantity) ? 0 : quantity);
		}, 0);
		return total === Number(supplyValue);
	});

	let allocationValid = $derived.by(
		() => allocationsValidNames && allocationsValidQuantities && allocationsValidTotalQuantity
	);

	let allocationIncrement = $state(1);

	function addAllocation() {
		allocationIncrement += 1;
		allocations.push({
			id: allocationIncrement,
			receiver: '',
			receiverValid: false,
			quantity: undefined,
			quantityValid: false
		});
	}

	const supplyPreview = $derived.by(() => {
		try {
			return Asset.fromFloat(Number(supplyValue), `${precisionValue},${tickerValue}`);
		} catch (error) {
			console.error('Error creating supply preview:', error);
			return undefined;
		}
	});

	$effect(() => {
		// if the ticker value changes, we need to invalidate the available state
		if (tickerValid && tickerAvailable === true) {
			if (tickerValue !== tickerValueDebounced.current) {
				console.log('debounced vs value differ, reset available');
				tickerAvailable = false;
			}
		}
	});

	$effect(() => {
		const name = String(tickerValueDebounced.current);
		if (name && tickerValid) {
			console.log('searching for', name);
			context.network.contracts.registry
				.table('tokens')
				.get(name)
				.then((token) => {
					console.log(JSON.stringify(token));
					tickerAvailable = false;
				})
				.catch((error) => {
					console.log('error', error);
					tickerAvailable = true;
				});
		}
	});

	let allValid = $derived.by(() => tickerValid);

	type FormStep = 'welcome' | 'ticker' | 'supply' | 'allocation' | 'preview' | 'complete';

	type FormEvent = 'next' | 'previous' | 'reset' | 'success' | 'error';

	const f = new FiniteStateMachine<FormStep, FormEvent>('welcome', {
		welcome: {
			next: 'ticker'
		},
		ticker: {
			next: () => (tickerValid ? 'supply' : 'ticker'),
			reset,
			_enter: () => tick().then(() => tickerRef?.focus())
		},
		supply: {
			next: () => (precisionValid && supplyValid ? 'allocation' : 'supply'),
			previous: 'ticker',
			reset,
			_enter: () => tick().then(() => precisionRef?.focus())
		},
		allocation: {
			next: () => (allocationValid ? 'preview' : 'allocation'),
			previous: 'supply',
			reset
		},
		preview: {
			next: () => (allValid ? 'complete' : 'preview'),
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
				return tickerValid;
			}
			case 'supply': {
				return precisionValid && supplyValid;
			}
			case 'allocation': {
				return allocationValid;
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

	function removeAllocation(id: number) {
		allocations = allocations.filter((allocation) => allocation.id !== id);
	}

	let id: Checksum256 | undefined = $state();
	let error: string | undefined = $state();

	async function transact() {
		if (!context.account) {
			throw new Error('No account selected');
		}
		if (!registryConfig?.fees.regtoken) {
			throw new Error('Registry contract not loaded');
		}
		if (!context.wharf.contractKit) {
			throw new Error('ContractKit not available');
		}
		const actor = context.account.name;
		const symbol = Asset.Symbol.from(`${precisionValue},${tickerValue}`);
		const tokenContract = await context.wharf.contractKit.load(tokenContractName);
		const actions = [
			// Open Balance
			context.network.contracts.registry.action('openbalance', {
				account: actor
			}),
			// Transfer fee
			context.network.contracts.token.action('transfer', {
				from: actor,
				to: context.network.contracts.registry.account,
				quantity: registryConfig.fees.regtoken,
				memo: ''
			}),
			// Register the token
			context.network.contracts.registry.action('regtoken', {
				creator: actor,
				ticker: tickerValue,
				payment: registryConfig.fees.regtoken
			}),
			// Set token contract
			context.network.contracts.registry.action('setcontract', {
				ticker: tickerValue,
				contract: tokenContractName
			}),
			// Set supply
			tokenContract.action('setsupply', {
				ticker: tickerValue,
				supply: Asset.fromFloat(Number(supplyValue), symbol)
			}),
			// Open balances for allocations
			...allocations.map((allocation) =>
				tokenContract.action('open', {
					owner: allocation.receiver,
					symbol,
					ram_payer: actor
				})
			),
			// Distribute tokens
			tokenContract.action('distribute', {
				ticker: tickerValue,
				allocations: allocations.map((allocation) => ({
					receiver: allocation.receiver,
					quantity: Asset.fromFloat(Number(allocation.quantity), symbol)
				}))
			})
		];
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
		placeholder={`Enter a ${minlength}-${maxlength} letter token ticker...`}
		onkeyup={onInputKeyboardEvent}
		bind:ref={tickerRef}
		bind:value={tickerValue}
	/>
{/snippet}

{#snippet PrecisionInput()}
	<TextInput
		id="precision-input"
		label="Token Precision"
		type="number"
		min="0"
		max="18"
		placeholder="Enter token precision (0-18)..."
		onkeyup={onInputKeyboardEvent}
		bind:ref={precisionRef}
		bind:value={precisionValue}
	/>
{/snippet}

{#snippet SupplyInput()}
	<TextInput
		id="supply-input"
		label="Token Supply"
		placeholder={`Enter token supply...`}
		onkeyup={onInputKeyboardEvent}
		bind:ref={supplyRef}
		bind:value={supplyValue}
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
				min={0.000000000000000001}
				bind:value={allocation.quantity}
				bind:valid={allocation.quantityValid}
			/>
			<Button variant="pill" onclick={() => removeAllocation(allocation.id)}>Remove</Button>
		</Card>
	{/key}
{/snippet}

{#snippet AllocationStep()}
	{#each allocations as allocation}
		{@render AllocationCustom(allocation)}
	{/each}
	<Button onclick={addAllocation}>Add Allocation</Button>
{/snippet}

{#snippet TickerStep()}
	{@render TickerInput()}
	<p>Rules</p>
	<ul>
		<li>Must be all uppercase letters (no numbers or special characters)</li>
		<li>Must be at least {minlength} characters</li>
		<li>Must be at most {maxlength} characters</li>
	</ul>
{/snippet}

{#snippet SupplyStep()}
	{@render PrecisionInput()}
	{@render SupplyInput()}
	<p>Supply Preview: {supplyPreview}</p>
	<p>Rules</p>
	<ul>
		<li>Must be a positive integer</li>
		<li>Must be at least 1</li>
		<li>Must not exceed {String(UInt64.max)}</li>
	</ul>
{/snippet}

{#snippet ButtonGroup()}
	{#if f.current === 'complete'}{:else if f.current === 'preview'}
		<Button onclick={transact} disabled={!allValid}>Create</Button>
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

<TransactForm {id} {error} onsuccess={Success} onfailure={Failure}>
	{#if f.current === 'welcome'}
		{#if registryConfig}
			<h2>Welcome</h2>
			<p>As a token creator, you will:</p>
			<ul>
				<li>Pay a fee of {registryConfig.fees.regtoken}</li>
				<li>
					Pay the fees required for the network resources (CPU, NET, RAM) to perform the creation
					and distribution.
				</li>
				<li>Select an available token ticker</li>
				<li>Select a type of token</li>
				<li>Define the tokens decimal precision and maximum supply</li>
				<li>Set the tokens initial distribution</li>
			</ul>
		{:else}
			<p>Loading {context.network} Registry...</p>
		{/if}
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
		<h2>Preview</h2>
		<p>Review the information below and click Create to create your token.</p>
		<Card>
			<ul>
				<li>Token Ticker: {tickerValue}</li>
				<li>Token Precision: {precisionValue}</li>
				<li>
					Token Supply:
					<AssetElement
						variant="full"
						value={Asset.fromFloat(Number(supplyValue), `${precisionValue},${tickerValue}`)}
					/>
				</li>
			</ul>
		</Card>
		<Card>
			<Table>
				{#snippet thead()}
					<TH class="text-lg font-bold">Receiving Account</TH>
					<TH class="text-lg font-bold">Quantity</TH>
				{/snippet}
				{#each allocations as allocation}
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
									`${precisionValue},${tickerValue}`
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
						{registryConfig?.fees.regtoken}
					</TD>
				</TR>
				<TR>
					<TD>Estimated RAM Usage</TD>
					<TD>{baseRAMCost + perOpenRAMCost * allocations.length} bytes</TD>
				</TR>
			</Table>
		</Card>
	{/if}
</TransactForm>

{@render ButtonGroup()}

{#if context.settings.data.debugMode}
	{#if f.current === 'ticker'}
		<Code
			json={{
				tickerValue,
				tickerValid,
				tickerAvailable
			}}
		/>
	{/if}

	{#if f.current === 'supply'}
		<Code
			json={{
				precisionValue,
				precisionValid,
				supplyValue,
				supplyValid,
				supplyPreview
			}}
		/>
	{/if}

	{#if f.current === 'allocation'}
		<Code
			json={{
				allocationIncrement,
				allocations,
				allocationValid,
				allocationsValidNames,
				allocationsValidQuantities,
				allocationsValidTotalQuantity
			}}
		/>
	{/if}

	<h2>Form State</h2>
	<Code
		json={{
			step: f.current,
			state: {
				tickerValue,
				precisionValue,
				supplyValue
			},
			currentStepValid,
			allValid,
			registryConfig
		}}
	/>
{/if}
