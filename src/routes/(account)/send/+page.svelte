<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { transact } from '$lib/wharf/transact.svelte';
	import { addToast } from '$lib/state/toaster.svelte';
	import Button from '$lib/components/button/button.svelte';

	const { data } = $props();
	const { wharf } = data;

	async function test() {
		if (wharf.contracts.token && wharf.session) {
			const action = wharf.contracts.token.action('transfer', {
				from: wharf.session.actor,
				to: 'teamgreymass',
				quantity: '0.0001 EOS',
				memo: 'test'
			});
			transact({ action });
		} else {
			alert('Not logged in');
		}
	}
</script>

{#if wharf.session}
	<h1>Send/Receive: {wharf.session.actor}</h1>
{/if}

{#if wharf.account}
	<p>{wharf.account.data.core_liquid_balance}</p>
	<Button onclick={test}>Send 0.0001 test</Button>
	<pre>{JSON.stringify(wharf.account.data, null, 2)}</pre>
{/if}
