<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import { getContext } from 'svelte';
	import { Bytes, Serializer } from '@wharfkit/antelope';
	import type { Contract } from '@wharfkit/contract';

	import { page } from '$app/stores';
	import { getSetting } from '$lib/state/settings.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Code from '$lib/components/code.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Textinput from '$lib/components/input/text.svelte';

	import Fields from './fields.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');
	const contract = getContext<Contract>('contract');
	const debugMode = getSetting('debug-mode', false);

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

	let state: Record<string, any> = $state({});
	if (data.data) {
		try {
			const action = Serializer.decode({
				data: Bytes.from(data.data),
				abi: data.abi,
				type: String(data.action.name)
			});
			if (action) {
				state = flatten(Serializer.objectify(action));
			}
		} catch (e) {
			console.error('Error decoding action:', e);
		}
	}

	const restructured = $derived.by(() => {
		return Object.keys(state).reduce((acc, key) => {
			const parts = key.split('->');
			let obj: Record<string, any> = acc;
			for (let i = 0; i < parts.length - 1; i++) {
				if (!obj[parts[i]]) {
					obj[parts[i]] = {};
				}
				obj = obj[parts[i]];
			}
			obj[parts[parts.length - 1]] = state[key];
			return acc;
		}, {});
	});

	const serialized = $derived.by(() => {
		try {
			return Serializer.encode({
				object: restructured,
				abi: data.abi,
				type: String(data.action.name)
			});
		} catch (e) {
			console.log(e);
			return undefined;
		}
	});

	const decoded = $derived.by(() => {
		try {
			return Serializer.decode({
				data: serialized,
				abi: data.abi,
				type: String(data.action.name)
			});
		} catch (e) {
			console.log(e);
			return undefined;
		}
	});

	const link = $derived(
		serialized
			? `${$page.url.protocol}//${$page.url.host}/${data.network}/contract/${data.contract}/actions/${data.action.name}/${serialized}`
			: undefined
	);

	function transact() {
		if (!serialized) {
			return;
		}
		const action = contract.action(data.action.name, serialized);
		context.wharf
			.transact({ action })
			.then((result) => {
				console.log('Transaction result', result);
			})
			.catch((error) => {
				console.error('Transaction error', error);
			});
	}
</script>

<Stack>
	<Grid>
		<Card>
			<Fields abi={data.abi} fields={data.actionData?.fields || []} {state} />
			<Button onclick={transact} disabled={!decoded}>Perform Action</Button>
		</Card>
		<Card>
			{#if data.ricardian}
				<h4 class="h4">Ricardian Contract</h4>
				{#if data.ricardian.meta}
					<p>Title: {data.ricardian.meta.title}</p>
					<p>Summary: {data.ricardian.meta.summary}</p>
				{/if}
				{#if data.ricardian.text}
					<p>{data.ricardian.text}</p>
				{/if}
			{/if}
			<h4 class="h4">Data Representation</h4>
			{#if decoded}
				<Code>{JSON.stringify(decoded, null, 2)}</Code>
			{:else}
				<p>Fill out the form to create a representation of the data in this type of action.</p>
			{/if}
		</Card>
	</Grid>
</Stack>

<h4 class="h4 mt-4">Transaction Link</h4>
<fieldset class="grid gap-2">
	<Label for="tx-link">
		{#if link}
			<a href={link}> The link to this transaction </a>
		{:else}
			Complete the transaction above to generate a shareable link.
		{/if}
	</Label>
	<Textinput value={link} readonly />
</fieldset>

{#if debugMode.value}
	<p>State</p>
	<Code>{JSON.stringify(state, null, 2)}</Code>
	<p>Decoded</p>
	<Code>{JSON.stringify(decoded, null, 2)}</Code>
	<p>Action</p>
	<Code>{JSON.stringify(data.action, null, 2)}</Code>
	<p>Action Data</p>
	<Code>{JSON.stringify(data.actionData, null, 2)}</Code>
{/if}
