<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/button/button.svelte';
	import { getWharf } from '$lib/state/client/wharf.svelte';
	import { getNetwork } from '$lib/state/network.svelte';

	const wharf = getWharf();
	const context = getContext<UnicoveContext>('state');

	async function test() {
		if (!wharf.session) {
			return;
		}
		const network = getNetwork(wharf.session.chain);
		if (network.contracts.token) {
			const action = network.contracts.token.action('transfer', {
				from: wharf.session.actor,
				to: 'teamgreymass',
				quantity: '0.0001 EOS',
				memo: 'test'
			});
			wharf.transact({ action });
		} else {
			alert('Not logged in');
		}
	}
</script>

{#if wharf.session}
	<h1>Send/Receive: {wharf.session.actor}</h1>
{/if}

{#if context.account.loaded}
	<p>{context.account.balance}</p>
	<Button onclick={test}>Send 0.0001 test</Button>
	<pre>{JSON.stringify(context.account.sources, null, 2)}</pre>
{/if}
