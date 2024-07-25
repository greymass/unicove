<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { wharf } from '$lib/wharf/service.svelte';
	import { transact } from '$lib/wharf/transact.svelte';
	import { addToast } from '$lib/state/toaster.svelte';

	export let data: PageData;

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
	<button onclick={test}>Send 0.0001 test</button>

	<pre>{JSON.stringify(wharf.account.data, null, 2)}</pre>
{/if}
