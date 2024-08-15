<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/button/button.svelte';
	import { getNetwork } from '$lib/state/network.svelte';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	async function test() {
		if (!context.wharf || !context.wharf.session) {
			return;
		}
		const network = getNetwork(context.wharf.session.chain);
		if (network.contracts.token) {
			const action = network.contracts.token.action('transfer', {
				from: context.wharf.session.actor,
				to: 'teamgreymass',
				quantity: '0.0001 EOS',
				memo: 'test'
			});
			context.wharf.transact({ action });
		} else {
			alert('Not logged in');
		}
	}
</script>

<h1>Send/Receive</h1>

<p>
	Available:
	{#if context.account}
		{context.account.balance?.liquid}
	{:else}
		0.0000
	{/if}
</p>

<Button disabled={!context.account} onclick={test}>Send 0.0001 test</Button>
