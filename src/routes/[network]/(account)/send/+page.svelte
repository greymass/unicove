<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import type { Checksum256 } from '@wharfkit/session';
	import { getContext, onMount } from 'svelte';

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
	let assetInput: AssetInput;

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
</script>

<h1>Send/Receive</h1>

{#if chain}
	<Code>{String(chain)}</Code>

	<h3 class="h3">State</h3>
	<Code>{JSON.stringify(state, undefined, 2)}</Code>

	<fieldset class="grid gap-3">
		<Label for="labeled-input">Account</Label>
		<TextInput bind:value={state.to} />
	</fieldset>

	<fieldset class="grid gap-3">
		<Label for="labeled-input">Amount</Label>
		<AssetInput
			id="assetInput"
			bind:this={assetInput}
			bind:value={state.quantity}
			max={state.max}
		/>
	</fieldset>

	<fieldset class="grid gap-3">
		<Label for="labeled-input">Memo</Label>
		<TextInput bind:value={state.memo} />
	</fieldset>

	<p>
		Available:
		{#if context.account}
			{context.account.balance?.liquid}
			<Button disabled={!context.account} onclick={max}>Fill Max</Button>
		{:else}
			0.0000
		{/if}
	</p>

	<Button disabled={!context.account} onclick={test}>Send</Button>
{/if}
