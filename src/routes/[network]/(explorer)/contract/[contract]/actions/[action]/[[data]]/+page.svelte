<script lang="ts">
	import { ABI, Bytes, Serializer } from '@wharfkit/antelope';
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';
	import Textinput from '$lib/components/input/textinput.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Fields from './fields.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Contract } from '@wharfkit/contract';
	import { Debounced } from 'runed';
	import { page } from '$app/stores';
	import { getSetting } from '$lib/state/settings.svelte';
	import { transactions } from '$lib/wharf/transact.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');
	const contract = getContext<Contract>('contract');
	const debugMode = getSetting('debug-mode', false);

	const action = data.abi.actions.find((s: ABI.Action) => s.name === data.action);
	const actionData = data.abi.structs.find((s: ABI.Struct) => s.name === action.type);

	function deriveFields(fieldType: string) {
		const struct = abi.structs.find((s: ABI.Struct) => s.name === fieldType);
		if (struct) {
			return struct.fields;
		}
		return [];
	}

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
				type: data.action
			});
			state = flatten(Serializer.objectify(action));
		} catch (e) {
			console.log(e);
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
				type: data.action
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
				type: data.action
			});
		} catch (e) {
			console.log(e);
			return undefined;
		}
	});

	const link = $derived(
		serialized
			? `${$page.url.protocol}//${$page.url.host}/${data.network}/contract/${data.contract}/actions/${data.action}/${serialized}`
			: undefined
	);

	function transact() {
		if (!serialized) {
			return;
		}
		const action = contract.action(data.action, serialized);
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

<h2 class="h2">Action: {data.action}</h2>
<Fields abi={data.abi} fields={actionData.fields} {state} />
<Button onclick={transact} disabled={!decoded}>Perform Action</Button>

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
	<Code>{JSON.stringify(action, null, 2)}</Code>
	<p>Action Data</p>
	<Code>{JSON.stringify(actionData, null, 2)}</Code>
{/if}
