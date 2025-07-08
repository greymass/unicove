<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import { getContext, onMount } from 'svelte';
	import { ABI, Bytes, Serializer } from '@wharfkit/antelope';
	import type { Contract } from '@wharfkit/contract';

	import { page } from '$app/state';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Action from '$lib/components/contract/action.svelte';
	import { Button } from 'unicove-components';
	import { Card } from 'unicove-components';
	import { Code } from 'unicove-components';
	import { Label } from 'unicove-components';
	import { TextInput } from 'unicove-components';
	import { CopyButton } from 'unicove-components';

	import Fields from './fields.svelte';
	import { MultiCard } from '$lib/components/layout';
	import { Checkbox } from 'unicove-components';
	import type { TransactResult } from '@wharfkit/session';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');
	const contract = getContext<Contract>('contract');

	let ready = $state(false);
	let actionInputs: Record<string, string | boolean> = $state({});
	let useReadOnly: boolean = $state(false);
	let triggerOnPageLoad: boolean = $state(false);
	let readonlyError = $state();
	let readonlyResult = $state();
	let transactResult: TransactResult | undefined = $state();
	let error: string | undefined = $state();

	const flatten = (
		obj: Record<string, any>,
		roots: string[] = [],
		sep = '->'
	): Record<string, any> =>
		Object.keys(obj).reduce(
			(acc, key) =>
				Object.assign(
					{},
					acc,
					Object.prototype.toString.call(obj[key]) === '[object Object]'
						? flatten(obj[key], roots.concat([key]), sep)
						: { [roots.concat([key]).join(sep)]: obj[key] }
				),
			{}
		);

	const restructured = $derived.by(() => {
		if (Object.keys(actionInputs).length === 0) {
			return {};
		}
		return Object.keys(actionInputs).reduce((acc, key) => {
			const parts = key.split('->');
			let obj: Record<string, any> = acc;
			for (let i = 0; i < parts.length - 1; i++) {
				if (!obj[parts[i]]) {
					obj[parts[i]] = {};
				}
				obj = obj[parts[i]];
			}
			try {
				obj[parts[parts.length - 1]] = JSON.parse(actionInputs[key] as string);
			} catch (e) {
				console.warn('restructured error', e);
				obj[parts[parts.length - 1]] = actionInputs[key];
			}
			return acc;
		}, {});
	});

	const serialized = $derived.by(() => {
		if (Object.keys(restructured).length === 0) {
			return Bytes.from('00');
		}
		try {
			return Serializer.encode({
				object: restructured,
				abi: data.abi,
				type: String(data.action.name)
			});
		} catch (e) {
			console.warn('serialized error', e);
			return undefined;
		}
	});

	const decoded = $derived.by(() => {
		if (!serialized) {
			return undefined;
		}
		try {
			return Serializer.decode({
				data: serialized,
				abi: data.abi,
				type: String(data.action.name)
			});
		} catch (e) {
			console.warn('decoded error', e);
			return undefined;
		}
	});

	const allowReadOnly = $derived.by(() => {
		return data.abi.action_results.find((s: any) => s.name === data.action.name);
	});

	const link = $derived(
		serialized
			? `${page.url.protocol}//${page.url.host}/${data.network}/contract/${data.contract}/actions/${data.action.name}/${serialized}?readonly=${useReadOnly}&triggerOnPageLoad=${triggerOnPageLoad}`
			: undefined
	);

	const api = $derived(
		serialized
			? `${page.url.protocol}//${page.url.host}/${data.network}/api/readonly/${data.contract}/${data.action.name}/${serialized}`
			: undefined
	);

	function transact() {
		if (!serialized) {
			return;
		}
		if (useReadOnly && data.contract) {
			readonlyError = undefined;
			readonlyResult = undefined;
			context.wharf
				.readonly(data.contract, data.action.name, JSON.parse(JSON.stringify(decoded)))
				.then((result) => {
					readonlyResult = result;
				})
				.catch((error) => {
					console.error('Readonly error', error);
					readonlyError = JSON.parse(error.message);
				});
		} else {
			const action = contract.action(data.action.name, serialized);

			context.wharf
				.transact({ action })
				.then((result) => {
					transactResult = result;
				})
				.catch((e) => {
					error = e;
					console.error('Transaction error', error);
				});
		}
	}

	function clear() {
		error = undefined;
		transactResult = undefined;
	}

	onMount(() => {
		useReadOnly = page.url.searchParams.get('readonly') === 'true';
		triggerOnPageLoad = page.url.searchParams.get('triggerOnPageLoad') === 'true';
		data.struct.fields.forEach((field: ABI.Field) => {
			switch (field.type) {
				case 'bool': {
					actionInputs[field.name] = false;
					break;
				}
				default: {
					actionInputs[field.name] = '';
					break;
				}
			}
		});
		try {
			const action = Serializer.decode({
				data: Bytes.from(data.data || '00'),
				abi: data.abi,
				type: String(data.action.name)
			});
			if (action) {
				const data = Serializer.objectify(action);
				Object.keys(data).forEach((key) => {
					if (typeof data[key] === 'object') {
						data[key] = JSON.stringify(data[key]);
					} else {
						data[key] = data[key];
					}
				});
				actionInputs = flatten(data);
				if (useReadOnly && triggerOnPageLoad) {
					setTimeout(() => {
						transact();
					}, 500);
				}
			}
		} catch (e) {
			console.error('Error decoding action:', e);
		}
		ready = true;
	});
</script>

<MultiCard>
	{#snippet leftColumn()}
		{#if transactResult && transactResult.resolved}
			<Card>
				<TransactSummary transactionId={transactResult.resolved.transaction.id} />
				<Button onclick={clear}>Clear Results</Button>
			</Card>
		{:else if error}
			<Card>
				<TransactError {error} />
				<Button onclick={clear}>Clear Results</Button>
			</Card>
		{:else}
			<Card title="Perform Action">
				{#if ready}
					<Fields abi={data.abi} fields={data.struct.fields} bind:state={actionInputs} />
				{/if}
				<Button onclick={transact} disabled={!decoded || context.wharf.transacting}>
					{#if useReadOnly}
						Call readonly action
					{:else}
						Perform transaction
					{/if}
				</Button>
				{#if allowReadOnly}
					<fieldset class="flex items-center gap-3">
						<Checkbox id="readonly" bind:checked={useReadOnly} />
						<Label for="readonly">Call as readonly action?</Label>
					</fieldset>
					<fieldset class="flex items-center gap-3">
						<Checkbox id="pageload" bind:checked={triggerOnPageLoad} />
						<Label for="pageload">Trigger when page loads?</Label>
					</fieldset>
				{/if}
			</Card>
		{/if}
	{/snippet}

	{#snippet rightColumn()}
		<Card title="Action Data">
			{#if decoded}
				<Code>{JSON.stringify(decoded, null, 2)}</Code>
			{:else}
				<p>Fill out the form to create a representation of the data in this type of action.</p>
			{/if}
			{#if link}
				<fieldset class="grid gap-2">
					<Label for="tx-link">
						<a href={link}> Sharable URL for this action and data </a>
					</Label>
					<TextInput value={link} disabled>
						<CopyButton data={link} />
					</TextInput>
				</fieldset>

				{#if useReadOnly && api}
					<fieldset class="grid gap-2">
						<Label for="tx-link">
							<a href={api}> API call which runs this readonly action </a>
						</Label>
						<TextInput value={api} disabled>
							<CopyButton data={api} />
						</TextInput>
					</fieldset>
				{/if}
			{/if}
		</Card>
	{/snippet}
</MultiCard>

{#if readonlyError}
	<Card title="Error during readonly call...">
		<Code>{JSON.stringify(readonlyError, null, 2)}</Code>
	</Card>
{/if}

{#if readonlyResult}
	<Card title="API Response">
		<Code>{JSON.stringify(readonlyResult, null, 2)}</Code>
	</Card>
{/if}

{#if transactResult}
	{#if transactResult.response}
		{#if transactResult.response.processed && transactResult.response.processed.action_traces}
			<Card title="Action Traces">
				<Code>{JSON.stringify(transactResult.response.processed.action_traces, null, 2)}</Code>
			</Card>
		{/if}

		<Card title="API Response">
			<Code>{JSON.stringify(transactResult.response, null, 2)}</Code>
		</Card>
	{/if}
{/if}

<ul class="grid grid-cols-[auto_1fr] gap-4 overflow-x-auto">
	<Action abi={data.abi} contract={data.contract} action={data.action} />
</ul>

{#if context.settings.data.debugMode}
	<p>Input Data</p>
	<Code>{JSON.stringify(actionInputs, null, 2)}</Code>
	<p>Decoded</p>
	<Code>{JSON.stringify(decoded, null, 2)}</Code>
	<p>Action</p>
	<Code>{JSON.stringify(data.action, null, 2)}</Code>
	<p>Struct</p>
	<Code>{JSON.stringify(data.struct, null, 2)}</Code>
{/if}
